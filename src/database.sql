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
    mid SERIAL PRIMARY KEY,
    uname VARCHAR (50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    messages VARCHAR (255),
    deleted BOOLEAN,
    edited BOOLEAN,
    newmid INTEGER
);

CREATE TABLE replies(
    repid SERIAL PRIMARY KEY,
    mid INTEGER,
    uname VARCHAR (50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    messages VARCHAR (255),
    deleted BOOLEAN
);