#ifndef _DUAN_DEFINE_2007_
#define _DUAN_DEFINE_2007_


typedef struct {
	unsigned char  from, to;
	unsigned char  capture;
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
}move;

const int NULL_MOVE = 0;               // 空着(Null-Move)常量，表示没有着法
const int NOVALUE = 9999;	//无意义估值
const char PieceNumToType[48] = {
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 6,
  0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 6
};

#define hashEXACT 0 
#define hashALPHA 1 
#define hashBETA 2

typedef struct{ 
	unsigned __int64 check; 
	int value; 
	int depth;
	int flag;
}HashNode; 

#endif