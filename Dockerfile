FROM node:18

WORKDIR /usr/src/app

COPY package*.json .

# cài node module trên server
RUN yarn install
# RUN yarn install --legacy-peer-deps

COPY prisma ./prisma/

RUN yarn prisma generate

COPY . .

EXPOSE 8080

CMD ["yarn","start"]

# cài đặt các ứng dụng cần thiết cho vps như: git, nodejs, docker
# dùng dịch vụ mysql của docker: lệnh phía dưới
# sudo apt update
# sudo apt upgrade
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
# apt install docker.io
# apt install git

# docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=123456 -p 3306:3306 mysql:latest

# docker build . -t img-backend
# docker run -d -p 8080:8080 --name cons-backend img-backend
# docker run -d -p 8080:8080 -e DATABASE_URL=mysql://root:123456@61.14.233.80:3306/db_25092023?schema=public -e USER_NAME=root -e PASS=123456 --name cons-backend img-backend


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

#truy cập vào container
# docker exec -it cons-be /bin/bash
# git clone địa chỉ github
# thoát và restart container