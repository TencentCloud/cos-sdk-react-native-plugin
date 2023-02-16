import * as React from 'react';
import Cos from 'tencentcloud-cos-sdk-react-native';
import Toast from 'react-native-toast-message';
import Spinner from 'react-native-loading-spinner-overlay';
import { StyleSheet, View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableHighlight, StatusBar, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getErrorMessage, readableStorageSize, toDateTimeString } from '../Utils';
import { ObjectEntity } from './ObjectEntity';
import type { CosService } from 'src/cos_service';
import type { RootStackParamList } from '../App';
import {
  SafeAreaInsetsContext
} from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'ObjectList'>;
export class ObjectListScreen extends React.Component<Props> {
  state = {
    isLoading: false,
    isPopupLoading: false,
    loadMoreState: -1,// -1:空view 0:正在加载 1:加载失败 2:加载完成
    objects: new Array<ObjectEntity>
  };

  private cosService: CosService | undefined;
  //分页标示
  private marker: string | undefined;
  //是否截断（用来判断分页数据是否完全加载）
  private isTruncated: boolean = false;

  componentDidMount() {
    this.props.navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={async () => {
          this.props.navigation.push('Upload', {
            bucketName: this.props.route.params.bucketName,
            bucketRegion: this.props.route.params.bucketRegion,
            folderPath: this.props.route.params.folderPath
          })
        }
        }>
          <View><Text style={{ color: "white", marginHorizontal: 16 }}>上传</Text></View>
        </TouchableOpacity>
      ),
    });

    this.loadData();
  };

  async getCosService(): Promise<CosService> {
    if (this.cosService == undefined) {
      if (Cos.hasService(this.props.route.params.bucketRegion)) {
        this.cosService = Cos.getService(this.props.route.params.bucketRegion);
      } else {
        this.cosService = await Cos.registerService(
          this.props.route.params.bucketRegion,
          {
            region: this.props.route.params.bucketRegion,
            isDebuggable: true,
          });
      }
    }
    return this.cosService;
  }

  async deleteObject(data: ObjectEntity){
    this.setState({ isPopupLoading: true });
    try {
      let cosService = await this.getCosService();
      await cosService.deleteObject(
        this.props.route.params.bucketName,
        data.getContent()!.key,
      );
      this.setState({
        isPopupLoading: false
      });
      this.loadData();
    } catch (e) {
      console.log(e);
      Toast.show({
        type: 'error',
        text1: getErrorMessage(e)
      });
      this.setState({ isPopupLoading: false });
    }
  }

  renderItemView(data: ObjectEntity) {
    if (data.getIsFolder()) {
      let text;
      if (this.props.route.params.folderPath == undefined || this.props.route.params.folderPath.length == 0) {
        text = data.getCommonPrefixes()!.prefix;
      } else {
        text = data
          .getCommonPrefixes()!
          .prefix
          .replace(this.props.route.params.folderPath!, "");
      }
      return <TouchableHighlight onPress={() =>
        this.props.navigation.push('ObjectList', {
          bucketName: this.props.route.params.bucketName,
          bucketRegion: this.props.route.params.bucketRegion!,
          folderPath: data.getCommonPrefixes()!.prefix
        })
      }>
        <View style={styles.item}>
          <View style={styles.itemContent}>
            <Text style={[styles.textFloder]}>{text}</Text>
          </View>
          <View style={styles.iconArrow}></View>
        </View>
      </TouchableHighlight>
    } else {
      let keySplitArr = data.getContent()!.key.split("/")
      return <View style={styles.item}>
        <View style={styles.itemContent}>
          <Text style={styles.textTitle}>名称：{keySplitArr[keySplitArr.length - 1]}</Text>
          <Text style={styles.textSubTitle}>创建时间：{toDateTimeString(data.getContent()!.lastModified)}</Text>
          <Text style={styles.textSubTitle}>大小：{readableStorageSize(data.getContent()!.size)}</Text>
        </View>
        <View style={styles.itemOperate}>
          <TouchableOpacity onPress={() =>
            this.props.navigation.push('Download', {
              bucketName: this.props.route.params.bucketName,
              bucketRegion: this.props.route.params.bucketRegion,
              fileKey: data.getContent()!.key
            })
          }>
            <Text style={styles.textOperate}>下载</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={async () => 
            this.deleteObject(data)
          }>
            <Text style={styles.textOperate}>删除</Text>
          </TouchableOpacity>
        </View>
      </View>
    }
  }

  //下拉刷新数据
  async loadData() {
    this.setState({ isLoading: true });
    try {
      //cos 分页获取对象列表
      let cosService = await this.getCosService();
      let bucketContents = await cosService.getBucket(
        this.props.route.params.bucketName,
        {
          prefix: this.props.route.params.folderPath,
          delimiter: "/",
          maxKeys: 100
        }
      );
      this.isTruncated = bucketContents.isTruncated;
      this.marker = bucketContents.nextMarker;
      this.setState({
        isLoading: false,
        objects: ObjectEntity.bucketContents2ObjectList(
          bucketContents, this.props.route.params.folderPath)
      });
      if (!this.isTruncated) {
        this.setState({ loadMoreState: 2 });
      }
    } catch (e) {
      console.log(e);
      Toast.show({
        type: 'error',
        text1: getErrorMessage(e)
      });
      this.setState({ isLoading: false });
    }
  }

  //上拉加载布局
  renderLoadMoreView() {
    if (this.state.isLoading || this.state.loadMoreState == -1) return <View></View>;

    let loadMoreText;
    if (this.state.loadMoreState == 0) {
      loadMoreText = '正在加载';
    } else if (this.state.loadMoreState == 1) {
      loadMoreText = '加载失败';
    } else if (this.state.loadMoreState == 2) {
      loadMoreText = '加载完成';
    }
    if (this.state.loadMoreState == 0) {
      return <View style={styles.loadMore}>
        <ActivityIndicator
          style={styles.indicator}
          animating={true}
        />
        <Text>{loadMoreText}</Text>
      </View>
    } else {
      return <View style={styles.loadMore}>
        <Text>{loadMoreText}</Text>
      </View>
    }
  }

  //上拉加载更多数据
  async loadMoreData() {
    if (this.state.isLoading || !this.isTruncated) return;

    this.setState({ loadMoreState: 0 });
    try {
      //cos 分页获取对象列表
      let cosService = await this.getCosService();
      let bucketContents = await cosService.getBucket(
        this.props.route.params.bucketName,
        {
          prefix: this.props.route.params.folderPath,
          delimiter: "/",
          marker: this.marker,
          maxKeys: 100
        }
      );
      this.isTruncated = bucketContents.isTruncated;
      this.marker = bucketContents.nextMarker;
      let objectsAll = this.state.objects.concat(ObjectEntity.bucketContents2ObjectList(
        bucketContents, this.props.route.params.folderPath));
      this.setState({
        loadMoreState: -1,
        objects: objectsAll
      });
      if (!this.isTruncated) {
        this.setState({ loadMoreState: 2 });
      }
    } catch (e) {
      console.log(e);
      Toast.show({
        type: 'error',
        text1: getErrorMessage(e)
      });
      this.setState({ loadMoreState: 1 });
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
              visible={this.state.isPopupLoading}
              textContent={'Loading...'}
              textStyle={styles.popupLoadingTextStyle}
            />
            <FlatList
              ItemSeparatorComponent={() => <View style={{ height: 8, flex: 1 }} />}
              data={this.state.objects}
              renderItem={(data) => this.renderItemView(data.item)}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.isLoading}
                  onRefresh={() => {
                    this.loadData();
                  }}
                />
              }
              ListFooterComponent={() => this.renderLoadMoreView()}
              onEndReached={() => this.loadMoreData()}
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
  itemOperate: {
    height: 'auto',
    marginRight: 15
  },
  iconArrow: {
    width: 10,
    height: 10,
    borderColor: '#666',
    borderTopWidth: 2,
    borderRightWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  textFloder: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'blue'
  },
  textTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textSubTitle: {
    fontSize: 16,
  },
  textOperate: {
    fontSize: 16,
    color: 'blue',
    textDecorationLine: 'underline',
    marginVertical: 6
  },
  loadMore: {
    alignItems: "center"
  },
  indicator: {
    margin: 10
  },
  popupLoadingTextStyle: {
    color: '#FFF'
  },
});
