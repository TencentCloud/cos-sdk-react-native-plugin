import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableHighlight, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import Cos from 'react-native-cos-sdk';
import { USE_SESSION_TOKEN_CREDENTIAL, STS_URL, COS_SECRET_ID, COS_SECRET_KEY, USE_SCOPE_LIMIT_TOKEN_CREDENTIAL, STS_SCOPE_LIMIT_URL, USE_CREDENTIAL } from './config/config';
import { ObjectListScreen } from './object/ObjectListScreen';
import { BucketListScreen } from './bucket/BucketListScreen';
import { BucketAddScreen } from './bucket/BucketAddScreen';
import { RegionListScreen } from './bucket/RegionListScreen';
import { DownloadScreen } from './transfer/DownloadScreen';
import { UploadScreen } from './transfer/UploadScreen';
import { TestScreen } from './test/TestScreen';
import type { STSCredentialScope } from 'react-native-cos-sdk';

export type RootStackParamList = {
  BucketList: { addBucket: boolean | undefined };
  BucketAdd: { region: string | undefined };
  RegionList: undefined;
  ObjectList: { bucketName: string, bucketRegion: string, folderPath: string | undefined };
  Download: { bucketName: string, bucketRegion: string, fileKey: string };
  Upload: { bucketName: string, bucketRegion: string, folderPath: string | undefined };
  Test: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
export default class App extends React.Component {
  componentDidMount() {
    if(USE_CREDENTIAL){
         // 初始化秘钥凭证
        if (USE_SESSION_TOKEN_CREDENTIAL) {
          if (!USE_SCOPE_LIMIT_TOKEN_CREDENTIAL) {
            // 使用临时密钥初始化
            Cos.initWithSessionCredentialCallback(async () => {
              // 请求临时密钥
              let response = null;
              try{
                response = await fetch(STS_URL);
              } catch(e){
                console.error(e);
                return null;
              }
              const responseJson = await response.json();
              const credentials = responseJson.credentials;
              const startTime = responseJson.startTime;
              const expiredTime = responseJson.expiredTime;
              const sessionCredentials = {
                tmpSecretId: credentials.tmpSecretId,
                tmpSecretKey: credentials.tmpSecretKey,
                startTime: startTime,
                expiredTime: expiredTime,
                sessionToken: credentials.sessionToken
              };
              console.log(sessionCredentials);
              return sessionCredentials;
            })
          } else {
            // 使用范围限制的临时密钥初始化
            Cos.initWithScopeLimitCredentialCallback(async (stsScopesArray:Array<STSCredentialScope>) => {
              // 请求范围限制的临时密钥
              console.log(JSON.stringify(stsScopesArray));
              let response = null;
              try{
                response = await fetch(STS_SCOPE_LIMIT_URL, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(stsScopesArray),
                });
              } catch(e){
                console.error(e);
                return null;
              }
              const responseJson = await response.json();
              const credentials = responseJson.credentials;
              const startTime = responseJson.startTime;
              const expiredTime = responseJson.expiredTime;
              const sessionCredentials = {
                tmpSecretId: credentials.tmpSecretId,
                tmpSecretKey: credentials.tmpSecretKey,
                startTime: startTime,
                expiredTime: expiredTime,
                sessionToken: credentials.sessionToken
              };
              console.log(sessionCredentials);
              return sessionCredentials;
            })
          }
        } else {
          // 使用永久密钥进行本地调试
          Cos.initWithPlainSecret(
            COS_SECRET_ID,
            COS_SECRET_KEY
          )
        }
    }
 

    // 设置静态自定义dns
    // const dnsArray = [
    //   {domain:'service.cos.myqcloud.com', ips: ["106.119.174.56", "106.119.174.57", "106.119.174.55"]},
    //   {domain:'000000-1253960454.cos.ap-guangzhou.myqcloud.com', ips: ["27.155.119.179", "27.155.119.180", "27.155.119.166", "27.155.119.181"]},
    //   {domain:'cos.ap-guangzhou.myqcloud.com', ips: ["27.155.119.179", "27.155.119.180", "27.155.119.166", "27.155.119.181"]},
    // ];
    // Cos.initCustomerDNS(dnsArray);
    // 设置动态自定义dns回调（更推荐使用 因为更灵活）
    // Cos.initCustomerDNSFetch(async (domain: string) => {
    //   const dnsMap: Map<string, string[]> = new Map([
    //     ['service.cos.myqcloud.com', ["106.119.174.56", "106.119.174.57", "106.119.174.55"]],
    //     ['cos.ap-guangzhou.myqcloud.com', ["27.155.119.179", "27.155.119.180", "27.155.119.166", "27.155.119.181"]],
    //   ]);
    //   let ips = null;
    //   dnsMap.forEach((value, key) => {
    //     if (domain.endsWith(key)) {
    //       console.log(`HOST: ${key}, IPS: ${JSON.stringify(value)}`);
    //       ips = value;
    //     }
    //   });
    //   return ips;
    // });
  };

  render() {
    return (
      <NavigationContainer>
        <RootStack.Navigator
          initialRouteName="BucketList"
          screenOptions={{
            title: 'COS 传输实践',
            headerStyle: {
              backgroundColor: '#42A5F5'
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20
            }
          }}
        >
          <RootStack.Screen
            name="BucketList"
            component={BucketListScreen}
            options={(props) => ({
              title: '存储桶列表',
              headerShown: true,
              headerRight: () => (
                <TouchableOpacity onPress={() =>
                  props.navigation.push('BucketAdd')
                  // props.navigation.push('Test')
                }>
                  <View><Text style={{ color: "white", marginHorizontal: 16 }}>新建存储桶</Text></View>
                </TouchableOpacity>
              ),
            })}
          />
          <RootStack.Screen
            name="BucketAdd"
            component={BucketAddScreen}
            options={() => ({
              title: "新建存储桶",
              headerShown: true
            })}
          />
          <RootStack.Screen
            name="RegionList"
            component={RegionListScreen}
            options={() => ({
              title: "选择区域",
              headerShown: true
            })}
          />
          <RootStack.Screen
            name="ObjectList"
            component={ObjectListScreen}
            options={({ route }) => ({
              title: route.params.folderPath ?? route.params.bucketName,
              headerShown: true
            })}
          />
          <RootStack.Screen
            name="Download"
            component={DownloadScreen}
            options={() => ({
              title: "下载文件",
              headerShown: true
            })}
          />
          <RootStack.Screen
            name="Upload"
            component={UploadScreen}
            options={() => ({
              title: "上传文件",
              headerShown: true,
            })}
          />
          <RootStack.Screen
            name="Test"
            component={TestScreen}
            options={() => ({
              title: "测试",
              headerShown: true,
            })}
          />
        </RootStack.Navigator>
        <Toast
          position='bottom' />
      </NavigationContainer>
    );
  }
}