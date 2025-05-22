import * as React from 'react';
import Toast from 'react-native-toast-message';
import { StyleSheet, View, Text, FlatList, RefreshControl, StatusBar, TouchableHighlight } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getDefaultService } from '../Constant';
import type { Bucket } from 'react-native-cos-sdk';
import { getErrorMessage, getSessionCredentials, toDateTimeString } from '../Utils';
import type { RootStackParamList } from '../App';
import { 
  SafeAreaInsetsContext
} from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'BucketList'>;
export class BucketListScreen extends React.Component<Props> {
  state = { isLoading: false, buckets: new Array<Bucket> };
  componentDidMount() {
    setTimeout(()=>this.loadData(), 2000);
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props) { 
    if(nextProps.route.params.addBucket == true){
      this.loadData();
      this.props.navigation.setParams({addBucket: false});
    }
  } 

  renderItemView(data: Bucket) {
    return <TouchableHighlight onPress={() =>
      this.props.navigation.push('ObjectList', {
        bucketName: data.name,
        bucketRegion: data.location!,
        folderPath: undefined
      })
    }>
      <View style={styles.item}>
        <View style={styles.itemContent}>
          <Text style={styles.textTitle}>名称：{data.name}</Text>
          <Text style={styles.textSubTitle}>地区：{data.location}</Text>
          <Text style={styles.textSubTitle}>创建时间：{toDateTimeString(data.createDate)}</Text>
        </View>
        <View style={styles.iconArrow}></View>
      </View>
    </TouchableHighlight>
  }

  //下拉刷新数据
  async loadData() {
    this.setState({ isLoading: true });
    try {
      let service = await getDefaultService();
      let listAllMyBuckets = await service.getService(await getSessionCredentials())
      this.setState({ isLoading: false, buckets: listAllMyBuckets.buckets});
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
          {paddingTop: insets!.top}
        ]}>
          <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
          <FlatList
            ItemSeparatorComponent={() => <View style={{ height: 8, flex: 1 }} />}
            data={this.state.buckets}
            renderItem={(data) => this.renderItemView(data.item)}
            refreshControl={
              <RefreshControl
                refreshing={this.state.isLoading}
                onRefresh={() => {
                  this.loadData();
                }}
              />
            }
          />
        </View>
       }
      </SafeAreaInsetsContext.Consumer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  item: {
    flexDirection: 'row',
    backgroundColor: "white",
    height: 'auto',
    padding: 15,
    alignItems: "center"
  },
  itemContent: {
    flex: 1,
    height: 'auto',
    justifyContent: "center",
    alignItems: "flex-start"
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
    fontWeight: 'bold',
  },
  textSubTitle: {
    fontSize: 16,
  }
});
