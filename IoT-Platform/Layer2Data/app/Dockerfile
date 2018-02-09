FROM maven:latest

COPY . .

RUN mvn compile

CMD ["mvn" , "exec:java"]
