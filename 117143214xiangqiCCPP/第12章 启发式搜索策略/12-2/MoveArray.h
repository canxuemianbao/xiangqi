#ifndef MOVE_ARRAY_H
#define MOVE_ARRAY_H

#include "Board.h"

struct MoveArrayStruct 
{
	int nMoveNum;	//走法个数
	move mvHash;	//置换表获得的走法
	move mvKiller1, mvKiller2;	//两个杀手走法
	move mvs[128];	//走法列表
	void Init(struct move mvHashArg, int nPly) ;	//初始化操作
};

extern move g_KillerMove[256][2];       // 杀手着法表

#endif