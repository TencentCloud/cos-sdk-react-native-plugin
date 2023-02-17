import * as React from 'react';
import Toast from 'react-native-toast-message';
import Cos from 'react-native-cos-sdk';
import { StyleSheet, View, Text, Button, StatusBar, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getCosXmlClientErrorMessage, getCosXmlServiceErrorMessage, getErrorMessage } from '../Utils';
import type { RootStackParamList } from '../App';
import {
  SafeAreaInsetsContext
} from 'react-native-safe-area-context';
import DocumentPicker, {
  isInProgress,
} from 'react-native-document-picker'
import type { CosTransferManger, TransferTask } from '../../../src/cos_transfer';
import { TransferState } from '../../../src/data_model/enums';
import { TransferProgressView } from './TransferProgressView';
import { createRef } from 'react';
import type { CosXmlClientError, CosXmlServiceError } from 'src/data_model/errors';

type Props = NativeStackScreenProps<RootStackParamList, 'Upload'>;
export class UploadScreen extends React.Component<Props> {
  state = {
    state: undefined,
    pickFilePath: undefined,
    pickFileName: undefined,
    resultString: undefined,
    resultColor: undefined,
  };
  private cosTransferManger: CosTransferManger | undefined;
  private transferTask: TransferTask | undefined;
  private myTransferProgressView = createRef<TransferProgressView>();
  private uploadId: string | undefined = undefined;

  componentDidMount() {
    this.props.navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={async () => {
          try {
            const pickerResult = await DocumentPicker.pickSingle()
            this.setState({
              pickFilePath: pickerResult.uri,
              pickFileName: pickerResult.name
            });
          } catch (e) {
            this.handleDocumentPickerError(e);
          }
        }
        }>
          <View><Text style={{ color: "white", marginHorizontal: 16 }}>选择文件</Text></View>
        </TouchableOpacity>
      ),
    });
  };

  handleDocumentPickerError(err: unknown) {
    if (DocumentPicker.isCancel(err)) {
      console.warn('cancelled')
      // User cancelled the picker, exit any dialogs or menus and move on
    } else if (isInProgress(err)) {
      console.warn('multiple pickers were opened, only the last will be considered')
    } else {
      throw err
    }
  }

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

  async upload() {
    if (this.state.pickFilePath == undefined) {
      this.setState({
        resultString: "错误信息：请先选择需要上传的文件",
        resultColor: "red"
      });
      return;
    }

    try {
      var cosPath = `${this.props.route.params.folderPath ?? ""}${this.state.pickFileName}`;
      let cosTransferManger: CosTransferManger = await this.getTransferManger();
      // 上传成功回调
      let successCallBack = (header?: object) => {
        this.setState({
          resultString: `文件已上传到COS：${cosPath}`,
          resultColor: "gray"
        });
      };
      //上传失败回调
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
      //上传状态回调
      let stateCallBack = (state: TransferState) => {
        this.myTransferProgressView.current?.changeTransferState(state);
        this.setState({
          state: state
        });
      };
      //上传进度回调
      let progressCallBack = (complete: number, target: number) => {
        this.myTransferProgressView.current?.changeTransferProgress(complete, target);
      };
      //初始化分块完成回调
      let initMultipleUploadCallBack = (bucket: string, cosKey: string, uploadId: string) => {
        this.uploadId = uploadId;
      };
      this.transferTask = await cosTransferManger.upload(
        this.props.route.params.bucketName,
        cosPath,
        this.state.pickFilePath,
        {
          uploadId: this.uploadId,
          resultListener: {
            successCallBack: successCallBack,
            failCallBack: failCallBack
          },
          stateCallback: stateCallBack,
          progressCallback: progressCallBack,
          initMultipleUploadCallback: initMultipleUploadCallBack,
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

            <Text style={styles.text}>已选文件名：{this.state.pickFileName ?? "未选择"}</Text>
            <Text style={styles.text}>已选文件Uri：{this.state.pickFilePath ?? "未选择"}</Text>
            <TransferProgressView ref={this.myTransferProgressView} />
            <View style={styles.rowView}>
              <View style={styles.button}>
                <Button
                  title={this.transferTask == undefined ? "开始" : "取消"}
                  onPress={async () => {
                    if (this.transferTask == undefined) {
                      this.upload();
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
                  title={this.state.state == TransferState.PAUSED ? "恢复" : "暂停"}
                  onPress={async () => {
                    try {
                      if (this.state.state == TransferState.PAUSED) {
                        await this.transferTask?.resume();
                      } else if (this.state.state == TransferState.IN_PROGRESS) {
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
    if (this.state.state == TransferState.IN_PROGRESS) {
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
