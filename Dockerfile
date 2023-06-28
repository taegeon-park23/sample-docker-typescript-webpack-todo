# Base 이미지
FROM node:20

# 작업 디렉토리 설정
WORKDIR /app

# 개발 의존성 설치
COPY package*.json ./
RUN npm install --only=development

# 소스 코드 복사
COPY . .

# 개발 서버 실행
CMD ["npm", "run", "dev"]