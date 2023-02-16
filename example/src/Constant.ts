import Cos from 'tencentcloud-cos-sdk-react-native';
import type { CosService } from 'src/cos_service';
import {PERSIST_BUCKET_REGION} from './config/config';

const SERVICE_CONFIG = {
    region: PERSIST_BUCKET_REGION,
    isDebuggable: true,
}

export async function getDefaultService(): Promise<CosService> {
    if(Cos.hasDefaultService()){
        return Cos.getDefaultService()
    } else {
        //注册默认service
        return await Cos.registerDefaultService(SERVICE_CONFIG)
    }
}