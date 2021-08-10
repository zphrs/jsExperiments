// Final project - pong.cpp : This file contains the 'main' function. Program execution begins and ends there.
//

#include "Header.h"
#include "linkedArray.cpp"
bool notBroken = true;
using namespace std;
/*
Constructor for ball.
random slope
*/
Ball::Ball(ScreenShape* bs, Screen* sc){
    x = (sc->getColumnCt()-1)/2;
    y = (sc->getRowCt()-1) / 2;
    y = 5;
    slope = (rand()%50)/50 + 1;
    direct = 1;
    this->ballShape = bs;
}
/*
Updates ball position, takes walls into consideration, but not paddles.
*/
void Ball::updatePos(Screen sc)
{
    x += direct;
    y += slope;
    if (y > static_cast<__int64>(sc.getRowCt())-2)
    {
        slope = -abs(slope);
    }
    else if (y < 2)
    {
        y = 1;
        slope = abs(slope);
    }
    ballShape->updatePos(x, y);
}
void Ball::revDirect()
{
    direct = -direct;
}
int Ball::getYInt() const
{
    return floor(this->y);
}
int Ball::getX() const
{
    return this->x;
}
/*
Player paddle constructor
*/
Ppaddle::Ppaddle(int yPos)
{
    setY(yPos);
}
/*
Updates paddle position with 'w' and 's' inputs.
*/
void Ppaddle::updatePos(Screen* paddlePos)
{
    paddlePos->shapes = new SafeArray();
    paddlePos->shapes->addItem(this->getSS());
    while (true)
    {
        cout << ">";
        string wAndS = "";
        getline(cin, wAndS);
        istringstream strstm(wAndS);
        char tmpchr;
        if (wAndS == "")
        {
            return;
        }
        while (strstm >> tmpchr)
        {
            if (tmpchr == 's')
            {
                if (paddlePos->getRowCt() > this->getY() + getHeight())
                    this->setY(static_cast<__int64>(this->getY()) + 1);

            }
            else if (tmpchr == 'w')
            {
                if (1 < this->getY())
                    this->setY(static_cast<__int64>(this->getY()) - 1);
            }
            else if (tmpchr == 'q')
            {
                this->getSS()->updateY(this->getY());
                paddlePos->updateScreen();
                paddlePos->saveFrame();
                return;
            }
        }
        system("CLS");
        this->getSS()->updateY(this->getY());
        paddlePos->updateScreen();
        paddlePos->saveFrame();
    }
}
/*
Checks for if the paddle is covering where the ball is. 
Called when the ball reaches index 0, aka the left wall.
*/
bool Paddle::isCoveringRow(int row) const
{
    return this->y <= row && row < this->height + this->y;
}
/*
Default paddle constructor
*/
Paddle::Paddle()
{
    this->y = 0;
    int height = 3;
}
/*
Sets screenShape for paddle so it can be rendered.
*/
void Paddle::setSS(ScreenShape* ss)
{
    this->ss = ss;
}
/*
Gets screenShape.
*/
ScreenShape* Paddle::getSS()
{
    return ss;
}
/*
Gets y
*/
int Paddle::getY()
{
    return this->y;
}
/*
Gets x
*/
int Paddle::getX()
{
    return this->x;
}
/*
Gets height
*/
int Paddle::getHeight()
{
    return this->height;
}
/*
Changes height. 
*/
void Paddle::setHeight(int x)
{
    this->height = x;
}
/*
Sets paddle y position (for movement)
*/
void Paddle::setY(double y)
{
    this->y = y;
}
/*
Screen shape initializer.
*/
ScreenShape::ScreenShape(int x, int y, int h, int w, string name, char chr)
{
    this->width = w;
    this->height = h;
    this->x = x;
    this->y = y;
    this->drawChar = chr;
    this->next = nullptr;
    this->dictKey = name;
}
/*
Updates ScreenShape position
*/
void ScreenShape::updatePos(int x, int y)
{
    this->x = x;
    this->y = y;
}
/*
Updates just the y of the screenShape
*/
void ScreenShape::updateY(int y)
{
    this->y = y;
}
/*
Updates the height of the screenShape.
*/
void ScreenShape::updateHeight(int h)
{
    this->height = h;
}
/*
The magic part:
Adds the screenShape object to the array
*/
void ScreenShape::addToScreen(Screen* s)
{
    {
        for (int i = 0; i < height; i++)
            for (int j = 0; j < width; j++)
            {
                if (s->rows >= this->y + i && this->y + i >= 0 && s->cols >= this->x + j && this->x + j >= 0)
                    s->screen[this->y + i][this->x + j] = this->drawChar;
            }
                
    }
}
/*
Screen initializer
*/
Screen::Screen()
{
    for (int i = 0; i < rows; i++)
    {
        screen[i][cols] = screen[i][cols] = '\0';
    }
    this->setBackplate();
    this->shapes = new SafeArray();

}
/*
Copies settings between rounds.
*/
Screen::Screen(const Screen& old)
{
    for (int i = 0; i < rows; i++)
    {
        screen[i][cols] = screen[i][cols] = '\0';
    }
    this->setBackplate();
    this->rows = old.rows;
    this->cols = old.cols;
    this->shapes = new SafeArray();

}
/*
Updates screen with screenShape objects, all stored in a safeArray object.
*/
void Screen::updateScreen()
{
    this->setBackplate();
    this->shapes->addToScreen(this);
}
/*
Sets backplate for screen. It makes the pretty dots and the walls.
*/
void Screen::setBackplate()
{
    for (int i = 0; i < cols; i++)
    {
        screen[rows - 1][i] = screen[rows - 1][i] = screen[0][i] = screen[0][i] = '_'; //horiz borders
    }
    for (int i = 1; i < rows-1; i++)
    {
        screen[i][0] = screen[i][0] = '.'; // vert borders
        screen[i][cols - 1] = screen[i][cols - 1] = '|';
    }
    for (int rowInd = 1; rowInd < rows - 1; rowInd++)
    {
        for (int colInd = 1; colInd < cols - 1; colInd++)
            screen[rowInd][colInd] = '.';
    }
}
/*
Gets row count
*/
int Screen::getRowCt()
{
    return this->rows;
}
/*
Gets column count
*/
int Screen::getColumnCt()
{
    return this->cols;
}
/*
Sets row count.
*/
void Screen::setRowCt(int row)
{
    if (row > 50)
    {
        this->rows = 50;
        cout << endl << "Set to 50, as that is the highest offered." << endl;
        return;
    }
    if (row < 5)
    {
        this->rows = 5;
        cout << endl << "Set to 5, as that is the lowest offered." << endl;
        return;
    }
    this->rows = row;
}
/*
Sets column count
*/
void Screen::setColumnCt(int col)
{
    if (col > 50)
    {
        this->cols = 50;
        cout << endl << "Set to 50, as that is the highest offered." << endl;
        return;
    }
    if (col < 5)
    {
        this->cols = 5;
        cout << endl << "Set to 5, as that is the lowest offered." << endl;
        return;
    }
    this->cols = col;
}
/*
Operator for outputting to console (and file) the array.
*/
ostream& operator<<(ostream& os, const Screen& sc)
{
    for (int i = 0; i < sc.rows; i++)
    {
        for (int j = 0; j < sc.cols; j++)
            os << sc.screen[i][j] << ' ';
        os << endl;

    }
    return os;
}
/*
Saves frame to the temp.txt file, which is cleared after each game.
*/
void Screen::saveFrame()
{

    string fileName = "temp.txt";
    ofstream tmp;
    tmp.open(fileName, ios::app);
    if (!tmp.fail())
    {
        tmp << *this << ',';

    }
    else
    {
        cout << "Unable to cache frame for later replay.";
    }
    tmp.close();
}
void Screen::clearShapes()
{
    this->shapes->clear();
}
/*
If there is a ctrl+c/ ctrl c command during a replay then this function will be called.
That way you can break out of the movie without breaking out of everything and reloading the app.
*/
void signal_callback_handler(int signum) {
    notBroken = false;
    while ((getchar()) != '\n');
}
/*
With a file name, it plays back a previous game. You can specify framerate 
in the settings menu.
*/

void Screen::playMovie(string fileName, int framerate)
{
    signal(SIGINT, signal_callback_handler);
    ifstream tmp(fileName);
    if (!tmp.fail())
    {
        tmp.unsetf(ios_base::skipws);
        char tmpchr;
        chrono::milliseconds timeBalance = chrono::milliseconds(0);
        while (!tmp.eof() && notBroken)
        {
            tmp >> tmpchr;
            chrono::milliseconds before = chrono::duration_cast<chrono::milliseconds>(
                chrono::system_clock::now().time_since_epoch());
            if (timeBalance > chrono::milliseconds(-framerate))
            {
                system("CLS");
                while (tmpchr != ',')
                {
                    cout << tmpchr;
                    tmp >> tmpchr;
                }
            }
            else
            {
                while (tmpchr != ',')
                {
                    tmp >> tmpchr;
                }
            }
            chrono::milliseconds sleepFor = chrono::milliseconds(framerate) - (chrono::duration_cast<chrono::milliseconds>(
                chrono::system_clock::now().time_since_epoch()) - before) + timeBalance;
            if (sleepFor > chrono::milliseconds(0))
            {
                this_thread::sleep_for(sleepFor);
                timeBalance = chrono::milliseconds(0);
            }
            else
            {
                timeBalance = sleepFor;
            }
        }
    }
    else
    {
        cout << "Unable to access file. Double check the inputted file name, and be sure there are no spaces in the file name.";
    }
    tmp.close();
}
/*
Combines all of the elements created into a game.
*/
void playGame(Screen* sc, int speed = 150)
{
    //inits
    srand(time(0));
    int score = 0;
    // Sets up the screen
    //Screen* sc = new Screen(); CHANGE
    double newHeightPerc = 7 / (static_cast<double>(score) + 10);
    double roundsBeforeInpPerc = 15 / (static_cast<double>(score) + 15);
    if (roundsBeforeInpPerc * sc->getColumnCt() >= sc->getColumnCt()-2)
        roundsBeforeInpPerc = 1 - 2 / static_cast<double>(sc->getColumnCt());
    // Sets up the paddle size
    Ppaddle ppaddle(1);
    int newHeight = round(10 / (static_cast<double>(score) + 2) + 1);
    newHeight = ceil(newHeightPerc * (sc->getRowCt() - 2));
    ppaddle.setHeight(newHeight);
    /*
    Initializes and organizes the various classes so that the ScreenShape objects are together in
    a SafeArray, then those same objects are added to their own respective classes.
    Now the classes can update the screenShapes, and the display can iterate through them easily.
    */
    sc->shapes->addItem(new ScreenShape(0, ppaddle.getY(), ppaddle.getHeight(), 1, "ppaddle", '#'));
    ppaddle.setSS(sc->shapes->getFromKey("ppaddle"));
    sc->shapes->addItem(new ScreenShape(rand() % sc->getColumnCt(), rand() % sc->getRowCt(), 1, 1, "ball", '@'));
    Ball ball(sc->shapes->getFromKey("ball"), sc);
    while ((getchar()) != '\n');
    /*
    All of the chrono elements are to make the ball move at a constant per-second rate.
    It makes it much easier to see. It accomplishes this by skipping rendering 
    frames to the console if the script gets too far behind real-world time. 
    You can change the speed of the ball in the settings menu, under Rate of gameplay.
    */
    chrono::milliseconds timeBalance = chrono::milliseconds(0);
    while (true)
    {
        chrono::milliseconds before = chrono::duration_cast<chrono::milliseconds>(
            chrono::system_clock::now().time_since_epoch());
        // If ball is over at the left side then up the score, and update dynamic elements
        //That change based on the score.
        if (ball.getX() == 0)
        {
            if (ppaddle.isCoveringRow(ball.getYInt()))
            {
                score++;
                ball.revDirect();

                newHeight = round(10 /(static_cast<double>(score)+2) + 1);
                newHeightPerc = 7 / (static_cast<double>(score) + 10);
                newHeight = ceil(newHeightPerc * (sc->getRowCt() - 2));
                ppaddle.setHeight(newHeight);
                ppaddle.getSS()->updateHeight(newHeight);
                
                roundsBeforeInpPerc = 15 / (static_cast<double>(score) + 15);
                if (roundsBeforeInpPerc * sc->getColumnCt() >= sc->getColumnCt()-2)

                    roundsBeforeInpPerc = 1 - 2 / static_cast<double>(sc->getColumnCt());
            }
            else
            {
                //Ends the game when the ball reaches index 0 and is not in line with the paddle.
                break;
            }
        }
        // Checks to see if the ball is at the other side
        if (ball.getX() == sc->getColumnCt() - 1)
        {
            //If it is, then it renders x number of frames (based on roundsBeforeInpPerc)
            //While making sure the frame stays fixed to real life
            ball.revDirect();
            for (int i = ceil(-roundsBeforeInpPerc * sc->getColumnCt())/2; i < ceil(roundsBeforeInpPerc * sc->getColumnCt())/2; i++)
            {
                ball.updatePos(*sc);
                sc->updateScreen();
                sc->saveFrame();
                if (timeBalance > chrono::milliseconds(-speed))
                {
                    system("CLS");
                    cout << *sc;
                }
                //The line below actually sets up easy easing to the pause where the user enters their information. It makes it look smooth, and it also lets the user know that it's time for input and gives them more time to study the trajectory.
                chrono::milliseconds sleepFor = chrono::milliseconds(static_cast<int>(speed + ((1 - exp(-i)) / (1 + exp(-i)) + 1) * speed)) - (chrono::duration_cast<chrono::milliseconds>(
                    chrono::system_clock::now().time_since_epoch()) - before) + timeBalance;
                if (sleepFor > chrono::milliseconds(0))
                {
                    this_thread::sleep_for(sleepFor/2);
                    timeBalance = sleepFor / 2;
                }
                else
                {
                    timeBalance = sleepFor;
                }
                before = chrono::duration_cast<chrono::milliseconds>(
                    chrono::system_clock::now().time_since_epoch());
            }
            //Then it updates the paddle position, resetting the timeBalance after as user input
            // resolves any time time balance.
            ppaddle.updatePos(sc);
            timeBalance = chrono::milliseconds(0);
            continue;
        }
        /* Updates ball position for every loop
        It will only print to console if it is on schedule, 
        otherwise it will skip that in favor of keeping the ball
        going on a constant per-second rate. 
        The frame is still saved even when not rendered, so you can always
        go back into the replay to watch every frame.
        */
        ball.updatePos(*sc);
        sc->updateScreen();
        sc->saveFrame();
        if (timeBalance > chrono::milliseconds(-speed))
        {
            system("CLS");
            cout << *sc;
        }
        chrono::milliseconds sleepFor = chrono::milliseconds(speed) - (chrono::duration_cast<chrono::milliseconds>(
            chrono::system_clock::now().time_since_epoch()) - before) + timeBalance;
        if (sleepFor > chrono::milliseconds(0))
        {
            this_thread::sleep_for(sleepFor/2);
            timeBalance = sleepFor / 2;
        }
        else
        {
            //Time balance is a positive or negative value, representing how the program stands
            //in respect to real life. It accounts for negative time primarily.
            timeBalance = sleepFor;
        }
    }
    /*
    Wrap up the game, as the ball missed the paddle and broke the loop.
    Shows score, offers to show replay, and offers to save replay file for later examination.
    */
    cout << "Your score is: " << score << endl << endl;
    ofstream replay;
    replay.open("temp.txt", ios::app);
    if (!replay.fail())
    {
        replay << "Your score was " << score << endl << ',';

    }
    else
    {
        cout << "Unable to cache score.";
    }
    replay.close();
    cout << "Would you like to watch a replay of that game? (y or n) >";
    char tmpchr;
    cin >> tmpchr;
    if (tmpchr == 'y')
        sc->playMovie("temp.txt", 200);
    while ((getchar()) != '\n');
    cout << "Enter a filename to save the replay or hit enter without entering anything to delete the replay. >";
    string filename = "";
    getline(cin, filename);
    if (filename.find(".txt") == string::npos)
        filename += ".txt";
    if (filename != ".txt")
    {
        if (rename("temp.txt", (filename).c_str()) != 0)
            perror("Error renaming file");
        else
            puts("File successfully saved.");
    }
    else if (remove("temp.txt") != 0)
        perror("Error deleting temp file");
    else
        puts("Temp file successfully deleted");
}
/*
The settings tab. Lets uers adjust the rates for each of the modes.
TODO: Let users adjust the window size. You can edit lines 18-19 in header.h to any values (within reason).
*/
void changeSettings(int &rOG, int &rOR, Screen &scr)
{
    int tmpInt;
    cout << "Rate of gameplay(currently " << rOG << ") >";
    cin >> tmpInt;
    rOG = tmpInt;
    cout << "Rate of replay(currently " << rOR << ") >";
    cin >> tmpInt;
    rOR = tmpInt;
    cout << "Rows(Currently " << scr.getRowCt() << ") >";
    cin >> tmpInt;
    scr.setRowCt(tmpInt);
    cout << "Columns(Currently " << scr.getColumnCt() << ") >";
    cin >> tmpInt;
    scr.setColumnCt(tmpInt);

}
/*
The menu, which allows you to access replays, the game, and the settings.

*/
void menu()
{
    remove("temp.txt");
    Screen* screen = new Screen();
    int choice = 0;
    int* rateOfGame = new int(250);
    int* rateOfReplay = new int(250);
    while (true)
    {
        notBroken = true;
        choice = 0;
        while (choice < 1 or choice > 4)
        {
            cout << "Enter the number cooresponding to the action: " << endl
                << "1 - Watch a replay file" << endl
                << "2 - Play a round" << endl
                << "3 - Change Settings" << endl
                << "4 - Exit" << endl
                << ">";
            cin >> choice;
        }
        string watchName;
        Screen* tmpPtr;
        switch (choice) {
        case 1:
            cout << "Enter the filename of the replay you would like to watch (no spaces allowed) >";
            cin >> watchName;
            if (watchName.find(".txt") == string::npos)
                watchName += ".txt";
            cout << "Hit ctrl-c to end replay prematurely and return to previous function" << endl;
            this_thread::sleep_for(chrono::seconds(2));
            screen->playMovie(watchName, *rateOfReplay);
            break;
        case 2:
            playGame(screen, *rateOfGame);
            screen->clearShapes();
            break;
        case 3:
            changeSettings(*rateOfGame, *rateOfReplay, *screen);
            break;
        case 4:
            return;
        }
    }
}
/*
Calls menu to start it all.
*/
int main()
{
    menu();
}

// Run program: Ctrl + F5 or Debug > Start Without Debugging menu
// Debug program: F5 or Debug > Start Debugging menu

// Tips for Getting Started: 
//   1. Use the Solution Explorer window to add/manage files
//   2. Use the Team Explorer window to connect to source control
//   3. Use the Output window to see build output and other messages
//   4. Use the Error List window to view errors
//   5. Go to Project > Add New Item to create new code files, or Project > Add Existing Item to add existing code files to the project
//   6. In the future, to open this project again, go to File > Open > Project and select the .sln file
