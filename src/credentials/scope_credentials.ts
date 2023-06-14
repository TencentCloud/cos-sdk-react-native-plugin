import type { SessionQCloudCredentials, STSCredentialScope } from "src/data_model/credentials";

export class ScopeLimitCredentialsProvider {
    // 范围限制临时秘钥缓存
    private static readonly MAX_CACHE_CREDENTIAL_SIZE = 100;
    private credentialPairs: Map<number, SessionQCloudCredentials> = new Map<number, SessionQCloudCredentials>();

    public forceInvalidationScopeCredentials(): void {
        this.credentialPairs.clear();
    }

    public async fetchScopeLimitCredentials(stsScopesArrayJson: string,
        callback: (stsScopesArray:Array<STSCredentialScope>) => Promise<SessionQCloudCredentials | null>): Promise<SessionQCloudCredentials | null> {
        // 先从缓存中获取，当scope一样的时候并且没有过期则使用缓存，否则调研业务回调方法获取最新的临时秘钥
        // 用于解决类似分块上传这种频繁但是秘钥大概率一样的情况
        const scopeId = this.hashCode(stsScopesArrayJson);
        let credentials = this.lookupValidCredentials(scopeId);
        if (credentials == null) {
            const stsScopesArray: Array<STSCredentialScope> = JSON.parse(stsScopesArrayJson);
            credentials = await callback(stsScopesArray.map((e) => {
                const scop: STSCredentialScope =  {
                    action: e == null ? '' : (e.action ?? ''),
                    region: e == null ? '' : (e.region ?? ''),
                    bucket: e == null ? '' : (e.bucket ?? ''),
                    prefix: e == null ? '' : (e.prefix ?? '')
                }
                return scop;
            }));
            if(credentials){
                this.cacheCredentialsAndCleanUp(scopeId, credentials);
            }
        }
        return credentials;
    }

    // 以下为实现范围限制临时秘钥缓存的代码
    private lookupValidCredentials(scopeId: number): SessionQCloudCredentials | null {
        const credentials = this.credentialPairs.get(scopeId);
        if (credentials != null && this.isValid(credentials)) {
            return credentials;
        }
        return null;
    }

    private cacheCredentialsAndCleanUp(scopeId: number, newCredentials: SessionQCloudCredentials): void {
        this.credentialPairs.forEach((value, key) => {
            if (!this.isValid(value)) {
                this.credentialPairs.delete(key);
            }
        });

        if (this.credentialPairs.size > ScopeLimitCredentialsProvider.MAX_CACHE_CREDENTIAL_SIZE) {
            const overSize = this.credentialPairs.size - ScopeLimitCredentialsProvider.MAX_CACHE_CREDENTIAL_SIZE;
            let count = 0;
            this.credentialPairs.forEach((_value, key) => {
                if (count < overSize) {
                    this.credentialPairs.delete(key);
                    count++;
                }
            });
        }

        this.credentialPairs.set(scopeId, newCredentials);
    }

    private hashCode(str: string): number{
        return str.split('').reduce((prevHash, currVal) =>
        ((prevHash << 5) - prevHash) + currVal.charCodeAt(0), 0);
    }

    private isValid(credentials: SessionQCloudCredentials): boolean {
        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000);
        return timestamp <= credentials.expiredTime - 60;
      }
}