import * as React from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { readableStorageSize } from '../Utils';
import type { TransferState } from 'react-native-cos-sdk';

type Props = {
}
export class TransferProgressView extends React.Component<Props> {
  private textProgress: Text | null = null;
  private changeProgressTimestamp: number = 0;
  state = {
    state: undefined,
    progress: 0,
    progressString: undefined
  };

  changeTransferState(state: TransferState) {
    this.setState({
      state: state
    });
  }

  changeTransferProgress(complete: number, target: number) {
    // 进度回调可能会非常频繁 因此此处限制300毫秒刷新一次进度
    if(Date.parse(new Date().toString()) - this.changeProgressTimestamp > 300 || complete === target){
      this.setState({
        progressString: `${readableStorageSize(complete)}/${readableStorageSize(target)}`,
        progress: complete / target
      });
      this.changeProgressTimestamp = Date.parse(new Date().toString());
    }

    // 如果不想限制进度刷新频率，可以使用setNativeProps提高UI刷新性能（不建议：与react界面刷新逻辑矛盾、且只支持核心组件）
    // this.textProgress?.setNativeProps({text: `${readableStorageSize(complete)}/${readableStorageSize(target)}`});
  }

  render() {
    return (
      <View>
        <View style={styles.rowView}>
          <Text style={[styles.text, { flex: 1 }]}>状态：{this.state.state ?? ""}</Text>
          <TextInput editable={false} defaultValue={this.state.progressString ?? ""} ref={component => this.textProgress = component} style={styles.text} />
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(this.state.progress * 100, 100)}%` }]} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rowView: {
    flexDirection: 'row',
    width: "100%",
    height: "auto",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    marginTop: 15
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'gray',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1976D2',
    borderRadius: 2,
  },
});
