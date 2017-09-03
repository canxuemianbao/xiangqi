
#include "Board.h"
#include <windows.h>

static unsigned long sg_TimeStart;	//每次搜索的起始时间 
static unsigned int sg_TimeLimit =0;	//每次搜索的时限
static int sg_FirstMoveNum = 50;
static int sg_SecondMoveNum = 60;
static int sg_ThirdMoveNum = 80;
static int sg_FirstTimeLimit = 60;
static int sg_SecondTimeLimit = 80;
static int sg_ThirdTimeLimit = 100;
static int sg_TimeOut;		//时间超出的变量

void CBoard::ChangeSide()
{
	side = 1- side;
}

bool  CBoard::MakeMove(move m)
{
	unsigned char from, dest, p;
	int SideTag = (side==0 ? 32:16);	//此处为对方将帅的值，其它地方多表示本方将帅值

	from = m.from; 
	dest = m.to;
	
	//设置走法栈
	MoveStack[StackTop].from = from; 
	MoveStack[StackTop].to = dest; 
	MoveStack[StackTop].capture = p = board[dest]; 
	StackTop++; 

	//设置棋子数组
	if(p>0)
		piece[p] = 0;
	piece[board[from]] = dest;

	//设置棋盘数组
	board[dest] = board[from];
	board[from] = 0;

	ply++; 

	ChangeSide();
	
	return p == SideTag;
}

void CBoard::UnMakeMove(void)
{
	unsigned char from, dest,p;
	
	StackTop--; 
	ply--; 
	
	ChangeSide();

	from = MoveStack[StackTop].from; 
	dest = MoveStack[StackTop].to;
	p = MoveStack[StackTop].capture;

	//设置棋盘数组
	board[from] = board[dest];
	board[dest] = p;

	//设置棋子数组
	if(p>0)
		piece[p] = dest;
	piece[board[from]] = from;
	
}

int CBoard::AlphaBetaSearch(int depth, int alpha, int beta)	// Alpha-Beta搜索算法
{
	int value;
	move MoveArray[128];
	move mv;
	int i;

	if(depth ==0)
		return Eval();
 
	if((GetTickCount() - sg_TimeStart)>=sg_TimeLimit)
	{
		sg_TimeOut = 1;
		return NOVALUE;
	}

	int num = GenAllMove(MoveArray);
	for(i = 0 ; i<num; i++)
	{
		mv = MoveArray[i];
		MakeMove(mv);
		value = -AlphaBetaSearch(depth -1, -beta, -alpha);
		UnMakeMove();
		if(value >= beta)
			return beta;
		if(value > alpha)
		{
			alpha = value;
			if(depth == MaxDepth)
				BestMove = mv;
		}
	}
	return alpha;
}

void CBoard::ComputerThink(int TimeLimit)
{
	BestMove.from = 0;
	BestMove.to = 0;
	move BackupMove;  //每层最佳着法
	
	if(TotalMoveNum< sg_FirstMoveNum)
	{
		sg_TimeLimit = TimeLimit / (sg_FirstTimeLimit - TotalMoveNum);
	}
	else if(TotalMoveNum< sg_SecondMoveNum)
	{
		sg_TimeLimit = TimeLimit / (sg_SecondTimeLimit - TotalMoveNum);
	}
	else if(TotalMoveNum< sg_ThirdMoveNum)
	{
		sg_TimeLimit = TimeLimit / (sg_ThirdTimeLimit - TotalMoveNum);
	}
	else
	{
		sg_TimeLimit = TimeLimit / 10;
	}
	TotalMoveNum++;
	sg_TimeStart  = GetTickCount();
	sg_TimeOut = 0;

	long bestmove;
	ply =0;
	BackupMove = BestMove; 
	for(MaxDepth=1; MaxDepth<20;MaxDepth++)
	{
		AlphaBetaSearch(MaxDepth,-MaxValue, MaxValue);
		if(sg_TimeOut)
			break;
		else
			BackupMove = BestMove; 
	}

	if(BackupMove.from ==0)
	{
		printf("nobestmove\n");
		fflush(stdout);
	}
	else
	{
		bestmove = BackupMove.Coord();
		printf("bestmove %.4s\n", (const char *) &bestmove);
		fflush(stdout);
	}
}