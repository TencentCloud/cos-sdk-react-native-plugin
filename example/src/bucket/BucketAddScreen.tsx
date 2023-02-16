import * as React from 'react';
import Toast from 'react-native-toast-message';
import { StyleSheet, View, Text, TextInput, Button, StatusBar, TouchableHighlight } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getDefaultService } from '../Constant';
import { getErrorMessage } from '../Utils';
import type { RootStackParamList } from '../App';
import {
  SafeAreaInsetsContext
} from 'react-native-safe-area-context';
import { COS_APP_ID } from '../config/config';

type Props = NativeStackScreenProps<RootStackParamList, 'BucketAdd'>;
export class BucketAddScreen extends React.Component<Props> {
  state = { region: undefined, isLoading: false };
  private bucketName: string | undefined = undefined;
  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    let newRegion = nextProps.route.params.region;
    if (newRegion != this.state.region) {
      this.setState({ region: newRegion });
    }
  }

  //创建存储桶
  async putBucket() {
    if(this.state.region == undefined){
      Toast.show({
        type: 'error',
        text1: "请选择地区"
      });
      return;
    }
    if(this.bucketName == undefined || this.bucketName.length == 0){
      Toast.show({
        type: 'error',
        text1: "桶名称不能为空"
      });
      return;
    }

    let bucket = `${this.bucketName}-${COS_APP_ID}`;

    this.setState({ isLoading: true });
    try {
      let service = await getDefaultService();
      await service.putBucket(
        bucket, 
        { region: this.state.region }
      );
      this.setState({ isLoading: false });
      this.props.navigation.navigate({
        name: 'BucketList',
        params: { addBucket: true },
        merge: true,
      })
    } catch (e) {
      console.log(e);
      Toast.show({
        type: 'error',
        text1: getErrorMessage(e)
      });
      this.setState({ isLoading: false });
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
            <Spinner
              visible={this.state.isLoading}
              textContent={'Loading...'}
              textStyle={styles.loadingTextStyle}
            />
            <TextInput
              style={styles.textInput}
              placeholder="请输入桶名称"
              onChangeText={text => this.bucketName = text}
            />
            <TouchableHighlight onPress={() =>
              this.props.navigation.push('RegionList')
            }>
              <View style={styles.region}>
                <Text style={styles.textTitle}>{this.state.region == undefined ? "请选择地区" : `已选择：${this.state.region}`}</Text>
                <View style={styles.iconArrow}></View>
              </View>
            </TouchableHighlight>
            <View style={styles.button}>
              <Button
                title="创建"
                onPress={() => {
                  this.putBucket();
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
  textInput: {
    width: "100%",
    height: "auto",
    marginVertical: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#999999'
  },
  region: {
    flexDirection: 'row',
    backgroundColor: "#eeeeee",
    width: "100%",
    height: "auto",
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  button: {
    width: "100%",
    height: 50,
    marginTop: 30,
  },
  iconArrow: {
    width: 10,
    height: 10,
    borderColor: '#666',
    borderTopWidth: 2,
    borderRightWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  textTitle: {
    fontSize: 18,
    flex: 1,
  },
  loadingTextStyle: {
    color: '#FFF'
  },
});
