# 1. WampServer 更改默认 web 目录

要更改 wamp 默认 web 目录 D:/wamp/www 为 D:/workspace/cloudTV/trunk/src

1. 打开 D:/wamp/scripts/config.inc.php, 找到 `$wwwDir = $c_installDir.’/www’;` (`$c_installDir` 是个变量，指向 WampServer 安装根目录)，修改为 `$wwwDir = D:/workspace/cloudTV/trunk/src`.

2. 更改 apache 默认根目录，打开 D:/wamp/bin/apache/Apache2.2.11/conf/httpd.conf, 查找 D:/wamp/www 修改为 D:/workspace/cloudTV/trunk/src。

3. 重启服务器。


# 2. 默认端口

    http 默认端口：80
    https 默认端口：443
    FTP 默认端口：21
    SSH 默认端口：22
    TELNET 默认端口：23
    SMTP 默认端口：25
    POP 默认端口：110
    DNS 默认端口：53
    Mysql 默认端口：3306
    Sql 默认端口：3389
    Tomcat 默认端口：8080

# 3. XAMPP 本地多域名虚拟主机配置

首先配置网站根目录 
    
    DocumentRoot "D:/workspace/www"
    <Directory "D:/workspace/www">
      ...
    </Directory>

注意：若根目录未配置，会有访问权限问题。

虚拟主机配置，在 httpd.conf 配置文件底部添加：

    <virtualhost *:80>
        ServerName www.xxx.cn
        DocumentRoot D:\workspace\www\phpcms
    </virtualhost>

    <virtualhost *:80>
        ServerName xx.baidu.com
        DocumentRoot D:\workspace\www\dedecms
    </virtualhost>

最后，修改 hosts 文件：

    127.0.0.1  www.xxx.cn
    127.0.0.1  xx.baidu.com


# 4. Tomcat 默认根目录修改

修改 $tomcat/conf/server.xml 文件：

    <Host name="localhost"  appBase="webapps" unpackWARs="true" autoDeploy="true">
      ...
    </Host>

增加一行：

    <Host name="localhost"  appBase="webapps" unpackWARs="true" autoDeploy="true">
      ...
      <Context path="" docBase="D:/workspace/www/example" debug="0" reloadable="true" crossContext="true" />
    </Host>

path 是说明虚拟目录的名字，如果你要只输入 IP 地址就显示主页，则该键值留空。

docBase 是虚拟目录的路径，它默认的是 $tomcat/webapps/ROOT 目录，现在我们将它指向 D:/workspace/www/example 目录，让该目录作为 tomcat 的默认目录。

debug 和 reloadable 一般都分别设置成 0 和 true。

### 默认首页设置

修改 $tomcat/conf/web.xml 文件。

    <welcome-file-list>
      <welcome-file>index.html</welcome-file>
      <welcome-file>index.htm</welcome-file>
      <welcome-file>index.jsp</welcome-file>
    </welcome-file-list>

插入一行 `<welcome-file>abc.jsp</welcome-file>`， 增加自定义的默认首页。

### 更改端口

    <Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />

将 port "8080" 改成自定义的端口，保存文件，重启 tomcat。

