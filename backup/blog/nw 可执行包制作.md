# NW 可执行包制作

## 1. nw 包制作

    zip ../demo.nw *

生成了一个名为 demo.nw 的文件，如果本机已经安装过 nw，双击该文件即可运行。但是，针对未安装过 nw 的用户，还需要将此 nw 的运行环境也打包在一起，并生成通用可执行文件，Mac 上 *.app，Windows 上 *.exe。

## 2. 针对Mac OS X，*.app文件制作

a）、app.icns文件制作

为你的App制作特定图标，可准备一张 1024*1024 的 png 图片，利用 icns-Tool 工具生成 app.icns 图标文件。

b）、修改 Info.plist 文件

为你的 App 制作或修改特定的描述文件。

c）、打包 *.app

从官网再次下载 node-webkit 的 Mac 版，命令行执行：

    mv demo.nw app.nw
    cp app.nw nwjs.app/Contents/Resources/
    cp app.icns nwjs.app/Contents/Resources/
    cp Info.plist nwjs.app/Contents/
    mv nwjs.app demo.app

至此，Mac OS X版本的可执行程序 demo.app 制作完成。一般情况下，都会将其压缩后再进行传播。

## 3. 针对Windows，*.exe文件制作

windows 版本的 exe 程序制作非常容易，从官网下载 node-webkit.exe，cmd 下执行：

    copy /b nwjs.exe+app.exe demo.exe

在 Linux 环境下，可以使用如下命令：

    cat node-webkit.exe app.exe > demo.exe

至此，Windows版本的 demo.exe 程序制作完成。

## 4. 将繁琐重复的操作整合到一个 build.sh 脚本中

    #! sh
    app_name="system-info"
      
    # 创建 app.nw 文件
    rm -rf output
    cd ../ && rm -rf output && mkdir output
    cp -r $app_name/* output
    rm -rf output/Info.plist output/build.sh output/app.icns
    cd output/
    find . -type d -name ".svn" | xargs rm -rf
    zip -r ../app.nw * > /dev/null;
    rm -rf * && cd ../ && mv app.nw output/
    mv output $app_name/ && cd $app_name
    echo "create nw file success!"
      
    #下载基础包
    svn co svn://localhost/node-webkit-base output > /dev/null
      
    #创建 mac 版本 app
    cd output
    unzip mac-os-x.zip -d mac-os-x > /dev/null
    rm -rf mac-os-x.zip mac-os-x/nwsnapshot
    if [ -f ../Info.plist ];then
        cp ../Info.plist mac-os-x/nwjs.app/Contents/
    fi
    cp app.nw mac-os-x/nwjs.app/Contents/Resources/
    if [ -f ../app.icns ];then
        cp ../app.icns mac-os-x/nwjs.app/Contents/Resources/
    fi
    mv mac-os-x/nwjs.app mac-os-x/$app_name.app
    echo "create mac os app success!"
      
    #创建 windows 版本 app
    unzip win-32.zip -d win-32 > /dev/null
    rm -rf win-32.zip win-32/nwsnapshot
    cp app.nw win-32/ && cd win-32
    cat nw.exe app.nw > $app_name.exe
    rm -rf nw.exe nwsnapshot.exe
    cd ..
    echo "create windows app success!"
      
    #删除 app.nw
    rm -f app.nw

