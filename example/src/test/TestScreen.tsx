import * as React from 'react';
import { StyleSheet, View, Button, StatusBar } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getDefaultService } from '../Constant';
import type { RootStackParamList } from '../App';
import {
  SafeAreaInsetsContext
} from 'react-native-safe-area-context';
import type { BucketContents } from 'src/data_model/object';
import Cos from 'react-native-cos-sdk';

type Props = NativeStackScreenProps<RootStackParamList, 'Test'>;
export class TestScreen extends React.Component<Props> {
  render() {
    return (
      <SafeAreaInsetsContext.Consumer>
        {(insets) =>
          <View style={[
            styles.container,
            { paddingTop: insets!.top }
          ]}>
            <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
            <View style={styles.button}>
              <Button
                title="存储桶head"
                onPress={async () => {
                  // 存储桶名称，由bucketname-appid 组成，appid必须填入，可以在COS控制台查看存储桶名称。 https://console.cloud.tencent.com/cos5/bucket
                  let bucket = "qqjjdd999-1253960454";
                  // 存储桶所在地域简称，例如广州地区是 ap-guangzhou
                  let region = "ap-beijing";
                  try {
                    let service = await getDefaultService();
                    let header = await service.headBucket(bucket,region);
                    console.log(header);
                  } catch (e) {
                    // 失败后会抛异常 根据异常进行业务处理
                    console.log(e);
                  }
                }}
              />
            </View>
            <View style={styles.button}>
              <Button
                title="删除存储桶"
                onPress={async () => {
                  // 存储桶名称，由bucketname-appid 组成，appid必须填入，可以在COS控制台查看存储桶名称。 https://console.cloud.tencent.com/cos5/bucket
                  let bucket = "examplebucket-1250000000";
                  // 存储桶所在地域简称，例如广州地区是 ap-guangzhou
                  let region = "COS_REGION";
                  try {
                    let service = await getDefaultService();
                    await service.deleteBucket(bucket,region);
                  } catch (e) {
                    // 失败后会抛异常 根据异常进行业务处理
                    console.log(e);
                  }
                }}
              />
            </View>
            <View style={styles.button}>
              <Button
                title="删除对象"
                onPress={async () => {
                  // 存储桶名称，由bucketname-appid 组成，appid必须填入，可以在COS控制台查看存储桶名称。 https://console.cloud.tencent.com/cos5/bucket
                  let bucket = "examplebucket-1250000000";
                  // 存储桶所在地域简称，例如广州地区是 ap-guangzhou
                  let region = "COS_REGION";
                  //对象在存储桶中的位置标识符，即对象键
                  let cosPath = "exampleobject";
                  try {
                    let service = await getDefaultService();
                    await service.deleteObject(bucket, cosPath, undefined, region);
                  } catch (e) {
                    // 失败后会抛异常 根据异常进行业务处理
                    console.log(e);
                  }
                }}
              />
            </View>
            <View style={styles.button}>
              <Button
                title="列出对象第一页数据"
                onPress={async () => {
                  // 存储桶名称，由bucketname-appid 组成，appid必须填入，可以在COS控制台查看存储桶名称。 https://console.cloud.tencent.com/cos5/bucket
                  let bucket = "examplebucket-1250000000";
                  try {
                    let service = await getDefaultService();
                    let bucketContents: BucketContents = await service.getBucket(
                      bucket,
                      {
                        prefix: "dir/", // 前缀匹配，用来规定返回的对象前缀地址
                        maxKeys: 100 // 单次返回最大的条目数量，默认1000
                      }
                    );
                    // 表示数据被截断，需要拉取下一页数据
                    let isTruncated = bucketContents.isTruncated;
                    // nextMarker 表示下一页的起始位置
                    let nextMarker = bucketContents.nextMarker;
                  } catch (e) {
                    // 失败后会抛异常 根据异常进行业务处理
                    console.log(e);
                  }
                }}
              />
            </View>
            <View style={styles.button}>
              <Button
                title="列出对象下一页数据"
                onPress={async () => {
                  // // 存储桶名称，由bucketname-appid 组成，appid必须填入，可以在COS控制台查看存储桶名称。 https://console.cloud.tencent.com/cos5/bucket
                  // let bucket = "examplebucket-1250000000";
                  // // prevPageBucketContents 是上一页的返回结果，这里的 nextMarker 表示下一页的起始位置
                  // let prevPageMarker = prevPageBucketContents.nextMarker;
                  // try {
                  //   let service = await getDefaultService();
                  //   let bucketContents: BucketContents = await service.getBucket(
                  //     bucket,
                  //     {
                  //       prefix: "dir/", // 前缀匹配，用来规定返回的对象前缀地址
                  //       marker: prevPageMarker, // 起始位置
                  //       maxKeys: 100 // 单次返回最大的条目数量，默认1000
                  //     }
                  //   );
                  //   // 表示数据被截断，需要拉取下一页数据
                  //   let isTruncated = bucketContents.isTruncated;
                  //   // nextMarker 表示下一页的起始位置
                  //   let nextMarker = bucketContents.nextMarker;
                  // } catch (e) {
                  //   // 失败后会抛异常 根据异常进行业务处理
                  //   console.log(e);
                  // }
                }}
              />
            </View>
            <View style={styles.button}>
              <Button
                title="获取对象列表与子目录"
                onPress={async () => {
                  // 存储桶名称，由bucketname-appid 组成，appid必须填入，可以在COS控制台查看存储桶名称。 https://console.cloud.tencent.com/cos5/bucket
                  let bucket = "examplebucket-1250000000";
                  // 定界符为一个符号，如果有 Prefix，
                  // 则将 Prefix 到 delimiter 之间的相同路径归为一类，定义为 Common Prefix，
                  // 然后列出所有 Common Prefix。如果没有 Prefix，则从路径起点开始
                  let delimiter = "/";
                  try {
                    let service = await getDefaultService();
                    let bucketContents: BucketContents = await service.getBucket(
                      bucket,
                      {
                        prefix: "dir/", // 前缀匹配，用来规定返回的对象前缀地址
                        delimiter: delimiter,
                        maxKeys: 100 // 单次返回最大的条目数量，默认1000
                      }
                    );
                    // 表示数据被截断，需要拉取下一页数据
                    let isTruncated = bucketContents.isTruncated;
                    // nextMarker 表示下一页的起始位置
                    let nextMarker = bucketContents.nextMarker;
                  } catch (e) {
                    // 失败后会抛异常 根据异常进行业务处理
                    console.log(e);
                  }
                }}
              />
            </View>
            <View style={styles.button}>
              <Button
                title="自定义源站域名"
                onPress={async () => {
                  // 存储桶region可以在COS控制台指定存储桶的概览页查看 https://console.cloud.tencent.com/cos5/bucket/ ，关于地域的详情见 https://cloud.tencent.com/document/product/436/6224
                  let region = "ap-beijing"; // 您的存储桶地域
                  let customDomain = "exampledomain.com"; // 自定义域名

                  // 创建 CosXmlServiceConfig 对象，根据需要修改默认的配置参数
                  let cosXmlServiceConfig = {
                    region: region,
                    isDebuggable: false,
                    isHttps: true,
                    hostFormat: customDomain // 修改请求的域名
                  };
                  // 注册默认 COS Service
                  await Cos.registerDefaultService(cosXmlServiceConfig)
                }}
              />
            </View>
            <View style={styles.button}>
              <Button
                title="全球加速域名"
                onPress={async () => {
                  // 存储桶region可以在COS控制台指定存储桶的概览页查看 https://console.cloud.tencent.com/cos5/bucket/ ，关于地域的详情见 https://cloud.tencent.com/document/product/436/6224
                  let region = "ap-beijing"; // 您的存储桶地域
                  let accelerate = true; // 使能全球加速域名

                  // 创建 CosXmlServiceConfig 对象，根据需要修改默认的配置参数
                  let cosXmlServiceConfig = {
                    region: region,
                    isDebuggable: false,
                    isHttps: true,
                    accelerate: accelerate
                  };
                  // 注册默认 COS Service
                  await Cos.registerDefaultService(cosXmlServiceConfig)
                }}
              />
            </View>
          </View>
        }
      </SafeAreaInsetsContext.Consumer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  button: {
    width: "100%",
    height: 50,
    marginTop: 10,
  },
  textTitle: {
    fontSize: 18,
    flex: 1,
  },
});
