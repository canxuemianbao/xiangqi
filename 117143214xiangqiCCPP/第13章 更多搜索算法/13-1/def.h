#ifndef _DUAN_DEFINE_2007_
#define _DUAN_DEFINE_2007_


struct move{
	unsigned char  from, to;
	unsigned short  capture;

	move operator =(move iMove) 
	{
	    from = iMove.from;
		to = iMove.to;
		capture = iMove.capture;
		return *this;
	}
	bool operator ==(move mv) const 
	{
		return from == mv.from && to &&mv.to;
	}
	bool operator !=(move mv) const 
	{
		return from != mv.from || to!=mv.to;
	}
	
	// 以下是着法跟字符串的转换，由于1个着法输入输出时表示成4个字符，所以用"long"存储和处理起来方便
	long Coord(void) const 
	{  // 把着法转换成字符串
		char szRetVal[4];
		szRetVal[0] = (from % 16) - 3 + 'a';
		szRetVal[1] = '9' - (from / 16) + 3;
		szRetVal[2] = (to % 16) - 3 + 'a';
		szRetVal[3] = '9' - (to / 16) + 3;
		return *(long *) szRetVal;
	}
	void Move(long dwMoveStr) 
	{ // 把字符串转换成着法
		char *ch;
		ch = (char *) &dwMoveStr;
		from = (ch[0] - 'a' + 3) + (('9' - ch[1] + 3) << 4);
		to = (ch[2] - 'a' + 3) + (('9' - ch[3] + 3) << 4);
	}	
};

const move NULL_MOVE = {0,0,0};               // 空着(Null-Move)常量，表示没有着法
const int NOVALUE = 9999;	//无意义估值
const int MaxValue = 3000;	//估值最大值
const int WinValue = 2550;	//估值最大值

const int MAX_BOOK_POS = 4096;    // 开局库附加表("BOOK_MULTI"表)的数量
const int MAX_BOOK_MOVE = 15;     // 开局库中一个局面允许的最多着法，尽量让"BookRecord"凑成整数

const char PieceNumToType[48] = {
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 6,
  0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 6
};

#define hashEXACT 0 
#define hashALPHA 1 
#define hashBETA 2
const int bookUNIQUE = 1; // 有单一着法的开局库局面
const int bookMULTI = 2;  // 有多个着法的开局库局面
const int bookEXIST = bookUNIQUE | bookMULTI;

typedef struct{ 
	unsigned __int64 check; 
	int value; 
	int depth;
	int flag;
	move goodmove;
}HashNode; 

#endif