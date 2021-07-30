#pragma once
#include <iostream>
#include <thread>
#include <chrono>
#include <cmath>
#include <sstream>
#include <fstream>
#include <string>
#include <stdio.h>
#include <signal.h>
using namespace std;
class SafeArray;
/*
Class that actually stores the text array. It also outputs the text array.
Responsible for rendering, saving, displaying, and storing.
*/
class Screen
{
private:
    int rows = 10;
    int cols = 10;
    char screen[52][52]; // Giving a bit of margin to avoid memory writing errors.
    void setBackplate();
public:
    Screen();
    Screen(const Screen& old);
    SafeArray* shapes;
    friend ostream& operator<<(ostream& os, const Screen& sc);
    void updateScreen();
    void saveFrame();
    void playMovie(string fileName, int framerate = 300);
    int getRowCt();
    int getColumnCt();
    void setRowCt(int row);
    void setColumnCt(int col);
    void clearShapes();
    friend class ScreenShape;
};
/*
Class that puts layers on top of the screen array. As a friend class, 
it can modify the screen array directly. 
*/
class ScreenShape
{
private:
    int x;
    int y;
    int width;
    int height;
    string dictKey;
    ScreenShape* next;
    char drawChar;
    friend class Screen;
    friend class SafeArray;
public:
    void updatePos(int x, int y);
    void updateY(int y);
    void updateHeight(int h);
    void addToScreen(Screen* s);
    ScreenShape(int x, int y, int h, int w, string name, char chr = '#');
};
/*
Stores the screenShapes in a pointer array.
*/
class SafeArray
{
private:
    ScreenShape* head;
    ScreenShape* tail;
public:
    SafeArray();
    ~SafeArray();

    ScreenShape* at(int index);
    ScreenShape* getFromKey(string key);

    void addItem(ScreenShape* value);
    int size();
    void clear();
    void addToScreen(Screen* s);

};
/*
Stores info about the ball and handles wall collisions/ball movement.
*/
class Ball
{
private:
    int x;
    double y;
    double slope;
    double direct;
    ScreenShape* ballShape;
public:
    Ball(ScreenShape* bs, Screen* sc);
    void revDirect();
    void updatePos(Screen sc);
    int getYInt() const;
    int getX() const;
};
/*
Parent class for paddle. Was initally planning to have 2 paddles, 
but then I shifted to the wall representation, as I thought it was misleading to
have another enemy paddle which never misses. Why give the player false hope?
The player will just get frustrated with that.

But if I do decide to add another paddle, I have this parent class.
Responsible for paddle collision detection and positioning of it.
Also has ability to dynamically change height.
*/
class Paddle
{
private:
    int y;
    const int x = 0;
    int height;
    ScreenShape* ss;
public:
    Paddle();
    void setHeight(int x);
    void setY(double y);
    bool isCoveringRow(int row) const;
    void setSS(ScreenShape* ss);
    ScreenShape* getSS();
    int getY();
    int getX();
    int getHeight();
};
/*
Player paddle. Responsible for getting user input to move the paddle. 
*/
class Ppaddle : public Paddle
{
public:
    Ppaddle(int yPos);
    void updatePos(Screen* paddlePos);
};
void menu();