# 百度电视云 OCEAN 云开发机配置文档

## 1、安装 ODP3.0 (正式版)

ssh 进入云开发机，在个人目录下，下载安装 odp

    mkdir /odp  # 想要安装ODP的目录
    cd /odp
    wget 'http://odp.baidu.com/download/odp-3.0.0-develop-nginx.tar.gz'
    tar xzf odp-3.0.0-*.tar.gz
    bin/odp_install

出现类似如下输出，说明安装成功：

    On first use, install package: hhvm Nginx odp PHP
    On first use, install binary: nginx php php-cgi

查看安装信息：

    bin/ocm list    # 查看安装的 ODP 组件列表
    php/bin/php -m  # 查看 php 扩展的加载情况


## 2、启动服务

启动 php: `php/sbin/php-fpm start`

启动 nginx: `webserver/loadnginx.sh start (stop|restart)`

ODP weberver 端口默认为 8080，如果端口已被占用，则需要修改相应配置文件中的端口：

    Nginx: webserver/conf/vhost/php.conf
    Lighttpd: webserver/conf/lighttpd.conf


关于 odp 及 nginx 相关问题，请查看这里 [传送门](http://man.baidu.com/inf/odp/#参考文档)

## 3、pull 项目

`~ cd odp/webroot` 进入 web 文档目录，svn checkout 拉取相应 web 项目

## 4、配置 php.conf

`~ vim odp/webserver/conf/vhost/php.conf` 找到以下代码（ocean 云开发机支持 samba 服务，不熟悉 vim 的同学可将云开发机映射到本地进行相关操作，具体配置移步 [ocean](http://ocean.baidu.com/) 或查看文档最下方附录）：

    # 统一配置全局的 rewrite 规则请打开如下配置项，并配置当前目录下的 rewrite 文件
    include vhost/rewrite;

把 `include vhost/rewrite` 前面的 # 注释符号去掉，启用全局 rewrite 配置

php.conf 中默认了几个 url rewrite, 可以不改，下方增加静态资源的 rewrite, 否则静态资源 MIME type 会以 text/html 返回（以下代码注意修改路径）：

    location ~ \.(css|js|jpg|jpeg|gif|png|swf) {
        root /home/users/{user}/odp/webroot;
    }

    location ~ \.html$ {
        root            /home/users/{user}/odp/webroot;
        fastcgi_pass    $php_upstream;
        fastcgi_index   index.html;
        include         fastcgi.conf;
    }
    
注意，以上的 rewrite 要放在下面一段代码之前：

    location / {
        root /home/users/{user}/odp/webroot;
        index index.php;
        fastcgi_pass    $php_upstream;
        include         fastcgi.conf;
        rewrite ^/([^/.]*)(/[^\?]*)?((\?.*)?)$ /$1/index.php$2$3 break;
    }

`webserver/loadnginx.sh restart` 重启 nginx


## 5、增加 url rewrite 

`~ vim odp/webserver/conf/vhost/rewrite` 这边只列举几个相关 url rewrite (注意修改 repo 路径)

    rewrite "^/rest/.*" /{repo}/controller.php last;

    rewrite "^/ssports/static/(.*)$" /{repo}/web/sport/static/$1 last;
    rewrite "^/ssports(.*)$" /{repo}/web/sport/controller.php last;

    rewrite "^/download$" /{repo}/web/v2/download.php last;
    rewrite "^/tvhelper$" /{repo}/web/v2/tvhelper.php last;
    rewrite "^/qa$" /{repo}/web/v2/qa.php last;
    rewrite "^/play$" /{repo}/web/v2/play.php last;
    rewrite "^/devices$" /{repo}/web/v2/devices.php last;
    rewrite "^/devices/(.*)$" /{repo}/web/v2/devices/$1.php last;
    rewrite "^/(.*)$" /{repo}/web/v2/$1 last;

`webserver/loadnginx.sh restart` 重启 nginx


## 附录

### OCEAN 云开发机 SAMBA 配置

1. 登录 Ocean。 http://ocean.baidu.com/

2. 在我的资源 -> 更多选择中设置 Samba 密码

3. 点击资源域名，查看开发机IP地址

4. Windows 下 win+r 运行框中输入 `\\{IP}` 地址 (Mac 下 cmd+k 输入 `smb://{IP}`)

5. 输入用户名和密码

6. 映射到磁盘


### phpredis 扩展安装

1、下载 phpredis 扩展源码

    wget https://codeload.github.com/nicolasff/phpredis/zip/master
    
解压：

    unzip master
    cd phpredis-master

2、执行下 `phpize` / `/usr/local/php/bin/phpize` 确认是否可用，显示的结果大概如下代码：

    Configuring for:
    PHP Api Version:         20090626
    Zend Module Api No:      20090626
    Zend Extension Api No:   220090626

3、配置 configure

odp 环境下，执行 `./configure --with-php-config=/home/users/xiejiancong01/odp/bin/php-config`

4、编译安装，执行 `make && make install`

5、添加模块

编辑 odp/php/etc/php.ini 文件，找到 extension_dir 的位置在下边添加如下内容：

    extension=redis.so
    
6、重启 php 和 nginx

    php/sbin/php-fpm restart
    webserver/loadnginx.sh restart
    
