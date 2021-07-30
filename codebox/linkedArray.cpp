#include "Header.h"
using namespace std;
SafeArray::SafeArray()
{
	this->head = nullptr;
	this->tail = nullptr;
}
void SafeArray::addToScreen(Screen* s)
{
	ScreenShape* ptr = this->head;
	while (ptr->next)
	{
		ptr->addToScreen(s);
		ptr = ptr->next;
	}
	ptr->addToScreen(s);
}
SafeArray::~SafeArray()
{
	char waste;
	cin >> waste;
	while (this->head != this->tail)
	{
		ScreenShape* nextToDel = this->head->next;
		delete this->head;
		this->head = nextToDel;
	}
	delete this->head;
}
void SafeArray::addItem(ScreenShape* ss)
{
	ScreenShape* p = ss;
	if (!this->head)
	{
		this->head = tail = p;
	}
	else
	{
		this->head->next = p;
		tail = p;
		p->next = nullptr;
	}
}
ScreenShape* SafeArray::getFromKey(string key)
{
	ScreenShape* ptr = this->head;
	while (ptr->dictKey != key && ptr!=this->tail)
	{
		ptr = ptr->next;
	}
	if (ptr->dictKey == key)
		return ptr;
	throw invalid_argument("Wrong key");
}
int SafeArray::size()
{
	if (!this->head)
		return 0;
	ScreenShape* ptr = this->head;
	int out = 1;
	while (ptr != this->tail)
	{
		ptr = ptr->next;
		out++;

	}
	return out;
}
void SafeArray::clear()
{
	ScreenShape* ptr = head;
	while (ptr != this->tail)
	{
		ScreenShape* nextToDel = head->next;
		delete ptr;
		ptr = nextToDel;
	}
	delete ptr;
	this->head = nullptr;
	this->tail = nullptr;
}
