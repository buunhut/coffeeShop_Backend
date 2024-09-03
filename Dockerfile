FROM node:18

WORKDIR /usr/src/app

COPY package*.json .
# COPY package*.json /usr/src/app/

# cài node module trên server
# RUN yarn install --legacy-peer-deps : lệnh này dùng để cho máy nào chạy ko dc, nó sẽ tìm đúng các thư viện thích hợp để cài cho máy của bạn
RUN yarn install --legacy-peer-deps

COPY prisma ./prisma/

RUN yarn prisma generate

# Cấu hình cho FE sẹt đường dẫn
# COPY nginx.conf /etc/nginx/nginx.conf

COPY . .

# quy định cứng cho port này bởi docker
EXPOSE 8080        

# Thay đổi người dùng mặc định của container thành root
USER root

CMD ["yarn","start"]
# CMD ["node","start"]


# docker exec -it cons-be bash && git pull && docker restart cons-be
# docker exec -it "tên_Container" bash => CICD => git pull
#run: curl http://ductandev.io.vn/update-code

# cài đặt các ứng dụng cần thiết cho vps như: git, nodejs, docker
# dùng dịch vụ mysql của docker: lệnh phía dưới
# sudo apt update
# sudo apt upgrade
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
# apt install docker.io
# apt install git

# docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=123456 -p 3306:3306 mysql:latest
# docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=XindungtatcuaEm1 -p 3306:3306 mysql:latest //chạy bên mới

# docker build . -t img-backend
# docker run -d -p 8080:8080 --name cons-backend img-backend
# docker run -d -p 8080:8080 -e DATABASE_URL=mysql://root:XindungtatcuaEm1@36.50.176.134:3306/nodejs_db?schema=public -e USER_NAME=root -e PASS=XindungtatcuaEm1 --name cons-backend img-backend


# cách bỏ port
# apt install docker-compose
# docker-compose -f docker-compose-nginx.yml up -d
# DOMAIN:81 => ĐỂ TRUY CẬP VÀO SETUP
# Email:    admin@example.com
# Password: changeme
# CHỌN host => proxy host => add proxy host

# ssh-keygen -R "61.14.233.80"
# ssh-keyscan -p 2018 61.14.233.80 >> ~/.ssh/known_hosts
# curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

# sudo apt-get install gcc g++ make