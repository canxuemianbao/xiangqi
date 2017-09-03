#ifndef MOVE_ARRAY_H
#define MOVE_ARRAY_H

#include "Board.h"

struct MoveArrayStruct 
{
	int nMoveNum;	//走法个数
	int index;
	move mvHash;	//置换表获得的走法
	move mvKiller1, mvKiller2;	//两个杀手走法
	move mvs[128];	//走法列表
	void Init(struct move mvHashArg, int nPly) ;	//初始化操作
	void SetNonCapValue(int start);	//提取不吃子走法的价值
	void Sort(void) ;
	void InitCap() ;	//初始化操作,只生成吃子走法，用于静态搜索
};

extern move g_KillerMove[256][2];       // 杀手着法表
extern unsigned char g_History[65536];  // 历史表

#endif