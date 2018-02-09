iptables -I INPUT -j ACCEPT
#install docker
sudo apt-get install docker
#install docker-compose
if [ ! -f "/usr/local/bin/docker-compose" ]
then
sudo curl -L https://github.com/docker/compose/releases/download/1.18.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
else
echo "Docker-Compose exists"
fi
docker-compose up -d


