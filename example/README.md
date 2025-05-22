yarn start
启动带日志的窗口

启动iOS：
cd ios
bundle install
bundle exec pod install
cd ..
yarn ios

启动Android：
yarn android


本地库SDK临时依赖：
1. 在sdk目录执行npm pack生成tgz包
2. 在example中进行依赖 "react-native-cos-sdk": "../react-native-cos-sdk-1.1.x.tgz",