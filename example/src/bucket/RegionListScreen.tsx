import * as React from 'react';
import { StyleSheet, View, Text, FlatList, StatusBar, TouchableHighlight } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { 
  SafeAreaInsetsContext
} from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'RegionList'>;
export class RegionListScreen extends React.Component<Props> {
  private regions: Array<[string, string]> = [
    ["ap-chengdu", "成都"],
    ["ap-beijing", "北京"],
    ["ap-guangzhou", "广州"],
    ["ap-shanghai", "上海"],
    ["ap-chongqing", "重庆"],
    ["ap-hongkong", "中国香港"],
    ["ap-beijing-fsi", "北京金融"],
    ["ap-shanghai-fsi", "上海金融"],
    ["ap-shenzhen-fsi", "深圳金融"],
    ["ap-singapore", "新加坡"],
    ["ap-mumbai", "印度孟买"],
    ["ap-seoul", "韩国首尔"],
    ["ap-bangkok", "泰国曼谷"],
    ["ap-tokyo", "日本东京"],
    ["eu-moscow", "俄罗斯莫斯科"],
    ["eu-frankfurt", "德国法兰克福"],
    ["na-toronto", "加拿大多伦多"],
    ["na-ashburn", "美东弗吉尼亚"],
    ["na-siliconvalley", "美西硅谷"]
   ]

  renderItemView(data: [string, string]) {
    return <TouchableHighlight onPress={() =>
      this.props.navigation.navigate({
        name: 'BucketAdd',
        params: { region: data[0] },
        merge: true,
      })
    }>
      <View style={styles.item}>
        <View style={styles.itemContent}>
          <Text style={styles.textTitle}>{data[1]}</Text>
        </View>
        <View style={styles.iconArrow}></View>
      </View>
    </TouchableHighlight>
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
            data={this.regions}
            renderItem={(data) => this.renderItemView(data.item)}
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
  }
});
