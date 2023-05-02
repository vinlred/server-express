CREATE DATABASE ppljserver;

CREATE TABLE users(
    uid SERIAL PRIMARY KEY,
    uname VARCHAR (50),
    pass VARCHAR (100),
    fname VARCHAR(50),
    lname VARCHAR(50),
    gender VARCHAR(10),
    date_of_birth DATE
);

CREATE TABLE messages(
    uname VARCHAR (50),
    postTime TIMESTAMP,
    messages VARCHAR (255)
)