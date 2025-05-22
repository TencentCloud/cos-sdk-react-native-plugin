import * as React from 'react';
import Toast from 'react-native-toast-message';
import Cos from 'react-native-cos-sdk';
import { StyleSheet, View, Text, Button, StatusBar } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DocumentDirectoryPath } from 'react-native-fs'
import { getCosXmlClientErrorMessage, getCosXmlServiceErrorMessage, getErrorMessage, getSessionCredentials } from '../Utils';
import type { RootStackParamList } from '../App';
import {
  SafeAreaInsetsContext
} from 'react-native-safe-area-context';
import type { CosTransferManger, TransferTask } from 'react-native-cos-sdk';
import { TransferState } from 'react-native-cos-sdk';
import { TransferProgressView } from './TransferProgressView';
import { createRef } from 'react';
import type { CosXmlClientError, CosXmlServiceError } from 'react-native-cos-sdk';

type Props = NativeStackScreenProps<RootStackParamList, 'Download'>;
export class DownloadScreen extends React.Component<Props> {
  state = {
    state: undefined,
    resultString: undefined,
    resultColor: undefined,
  };
  private cosTransferManger: CosTransferManger | undefined;
  private transferTask: TransferTask | undefined;
  private myTransferProgressView = createRef<TransferProgressView>()

  async getTransferManger(): Promise<CosTransferManger> {
    if (this.cosTransferManger == undefined) {
      if (Cos.hasTransferManger(this.props.route.params.bucketRegion)) {
        this.cosTransferManger = Cos.getTransferManger(this.props.route.params.bucketRegion);
      } else {
        this.cosTransferManger = await Cos.registerTransferManger(
          this.props.route.params.bucketRegion,
          {
            region: this.props.route.params.bucketRegion,
            isDebuggable: true,
          });
      }
    }
    return this.cosTransferManger!;
  }

  async download() {
    try {
      var downliadPath = `${DocumentDirectoryPath}/cos_download_${this.props.route.params.fileKey.split("/").pop()}`;
      let cosTransferManger: CosTransferManger = await this.getTransferManger();
      let successCallBack = (header?: object) => {
        console.log(header);
        this.setState({
          resultString: `文件已下载到：${downliadPath}`,
          resultColor: "gray"
        });
      };
      let failCallBack = (clientError?: CosXmlClientError, serviceError?: CosXmlServiceError) => {
        if (clientError) {
          this.setState({
            resultString: `错误信息：${getCosXmlClientErrorMessage(clientError)}`,
            resultColor: "red"
          });
          console.log(clientError);
        }
        if (serviceError) {
          this.setState({
            resultString: `错误信息：${getCosXmlServiceErrorMessage(serviceError)}`,
            resultColor: "red"
          });
          console.log(serviceError);
        }
      };
      let stateCallBack = (state: TransferState) => {
        this.myTransferProgressView.current?.changeTransferState(state);
        this.setState({
          state: state
        });
      };
      let progressCallBack = (complete: number, target: number) => {
        this.myTransferProgressView.current?.changeTransferProgress(complete, target);
      };
      this.transferTask = await cosTransferManger.download(
        this.props.route.params.bucketName,
        this.props.route.params.fileKey,
        downliadPath,
        {
          resultListener: {
            successCallBack: successCallBack,
            failCallBack: failCallBack
          },
          stateCallback: stateCallBack,
          progressCallback: progressCallBack,
          sessionCredentials: await getSessionCredentials()
        }
      );
    } catch (e) {
      console.log(e);
      Toast.show({
        type: 'error',
        text1: getErrorMessage(e)
      });
    }
  }

  render() {
    return (
      <SafeAreaInsetsContext.Consumer>
        {(insets) =>
          <View style={[
            styles.container,
            { paddingTop: insets!.top }
          ]}>
            <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
            <Text style={styles.text}>文件名：{this.props.route.params.fileKey.split("/").pop()}</Text>
            <TransferProgressView ref={this.myTransferProgressView} />
            <View style={styles.rowView}>
              <View style={styles.button}>
                <Button
                  title={this.transferTask == undefined ? "开始" : "取消"}
                  onPress={async () => {
                    if (this.transferTask == undefined) {
                      this.download();
                    } else {
                      try {
                        await this.transferTask?.cancel();
                      } catch (e) {
                      }
                      this.props.navigation.goBack();
                    }
                  }}
                />
              </View>
              <View style={{ width: 20 }} />
              <View style={styles.button}>
                <Button
                  title={this.state.state == 'PAUSED' ? "恢复" : "暂停"}
                  onPress={async () => {
                    try {
                      if (this.state.state == 'PAUSED') {
                        await this.transferTask?.resume();
                      } else if (this.state.state == 'IN_PROGRESS') {
                        await this.transferTask?.pause();
                      }
                    } catch (e) {
                      console.log(e);
                      Toast.show({
                        type: 'error',
                        text1: getErrorMessage(e)
                      });
                    }
                  }}
                />
              </View>
            </View>
            <Text style={[styles.text, { color: this.state.resultColor }]}>{this.state.resultString ?? ""}</Text>
          </View>
        }
      </SafeAreaInsetsContext.Consumer>
    );
  }

  async componentWillUnmount() {
    if (this.state.state == 'IN_PROGRESS') {
      try {
        await this.transferTask?.pause();
      } catch (e) {
        console.log(e);
        Toast.show({
          type: 'error',
          text1: getErrorMessage(e)
        });
      }
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  rowView: {
    flexDirection: 'row',
    width: "100%",
    height: "auto",
    alignItems: "center",
  },
  button: {
    flex: 1,
    height: 50,
    marginTop: 30,
  },
  text: {
    fontSize: 16,
    marginTop: 15
  },
});
