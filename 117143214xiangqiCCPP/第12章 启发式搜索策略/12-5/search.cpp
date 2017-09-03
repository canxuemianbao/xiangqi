#include <memory.h>
#include "Board.h"
#include <windows.h>
#include "MoveArray.h"

static unsigned long sg_TimeStart;	//每次搜索的起始时间 
static unsigned int sg_TimeLimit =0;	//每次搜索的时限
static int sg_FirstMoveNum = 50;
static int sg_SecondMoveNum = 60;
static int sg_ThirdMoveNum = 80;
static int sg_FirstTimeLimit = 60;
static int sg_SecondTimeLimit = 80;
static int sg_ThirdTimeLimit = 100;
static int sg_TimeOut;		//时间超出的变量
static int sg_DepthTimer;	//按深度/时间搜索 = 1 时间 =0深度

static void SaveGoodMove(move mv, int nDepth, int nPly)
{
	int i;
	int k = mv.from * 256 + mv.to;
	g_History[k] += (nDepth*nDepth) ;
	if (g_History[k] >= 65000) 
	{
		// 为防止溢出而对历史表进行缩减
		for (i = 0; i < 65536; i ++) 
		{
			g_History[i] -= g_History[i] / 4;
		}
	}
	if (g_KillerMove[nPly][0] != mv) 
	{
		g_KillerMove[nPly][1] = g_KillerMove[nPly][0];
		g_KillerMove[nPly][0] = mv;
	}
}

void CBoard::ChangeSide()
{
	side = 1- side;
	ZobristKey ^= ZobristPlayer;
	ZobristKeyCheck ^= ZobristPlayerCheck;
}

bool  CBoard::MakeMove(move m)
{
	unsigned char from, dest, p;
	int SideTag = (side==0 ? 32:16);	//此处为对方将帅的值，其它地方多表示本方将帅值
	int pt;
	int pc;

	from = m.from; 
	dest = m.to;
	
	//设置走法栈
	MoveStack[StackTop].from = from; 
	MoveStack[StackTop].to = dest; 
	MoveStack[StackTop].capture = p = board[dest]; 
	StackTop++; 

	//设置棋子数组
	if(p>0)
	{
		piece[p] = 0;
		pt = PieceNumToType[p];
		if (p>=32)
		{
			pt += 7;
		}
		ZobristKey ^= ZobristTable[pt][dest];
		ZobristKeyCheck ^= ZobristTableCheck[pt][dest];
	}		
	piece[board[from]] = dest;

	//设置棋盘数组
	pc = board[dest] = board[from];
	board[from] = 0;

	pt = PieceNumToType[pc];
	if (pc>=32) 
	{
		pt += 7;
	}
	ZobristKey ^= ZobristTable[pt][dest] ^ ZobristTable[pt][from];
	ZobristKeyCheck ^= ZobristTableCheck[pt][dest] ^ ZobristTableCheck[pt][from];

	ply++; 

	ChangeSide();
	
	return p == SideTag;
}

void CBoard::UnMakeMove(void)
{
	unsigned char from, dest,p;
	int pt;
	int pc;
	StackTop--; 
	ply--; 
	
	ChangeSide();

	from = MoveStack[StackTop].from; 
	dest = MoveStack[StackTop].to;
	p = (unsigned char )MoveStack[StackTop].capture;

	//设置棋盘数组
	pc = board[from] = board[dest];
	board[dest] = p;

	pt = PieceNumToType[pc];
	if (pc>=32) 
	{
		pt += 7;
	}
	ZobristKey ^= ZobristTable[pt][from] ^ ZobristTable[pt][dest];
	ZobristKeyCheck ^= ZobristTableCheck[pt][from] ^ ZobristTableCheck[pt][dest];

	//设置棋子数组
	if(p>0)
	{
		piece[p] = dest;
		pt = PieceNumToType[p];
		if (p>=32)
		{
			pt += 7;
		}
		ZobristKey ^= ZobristTable[pt][dest];
		ZobristKeyCheck ^= ZobristTableCheck[pt][dest];

	}
	piece[board[from]] = from;
	
}
int CBoard::QuiescentSearch (int alpha,int beta)	//静态搜索算法
{
	int value ,best;
	int i;
	MoveArrayStruct mvList;
	move mv;
	best =g_Board.ply  -MaxValue;	//杀棋步数裁剪
	if(best>beta)
		return best;

	value = Eval();
	if(value > beta)
		return value;
	if(value >alpha)
		alpha = value;

	mvList.InitCap();
	for(i = 0 ; i<mvList.nMoveNum; i++)
	{
		mv = mvList.mvs[i];
		if (MakeMove(mv)) 
		{
			value = MaxValue - ply;
		}
		else
		{
			value = -QuiescentSearch(-beta, -alpha);
		}			
		UnMakeMove();
		if(value >= beta)
		{
			return value;
		}							
		if (value > best) 
		{
			best = value;
			if(value > alpha)
			{
				alpha = value;
			}
		}			
	}
	return best;
}
int CBoard::AlphaBetaSearch(int depth, int alpha, int beta)	// Alpha-Beta搜索算法
{
	int value,best;
	MoveArrayStruct mvList;
	move mv,goodmove;
	int i;
	mv = goodmove = NULL_MOVE;
	value = ReadHashTable(depth,alpha,beta,mv);

	if (value != NOVALUE) 
	{
		return value;
	}

	if(sg_DepthTimer && (GetTickCount() - sg_TimeStart)>=sg_TimeLimit)
	{
		sg_TimeOut = 1;
		return NOVALUE;
	}

	
	best = -NOVALUE;
	int alphaFlag = 1;

	if(depth <=0)
	{
		return QuiescentSearch(alpha, beta);
	}		
	else
	{	

		mvList.Init(mv,ply);
		for(i = 0 ; i<mvList.nMoveNum; i++)
		{
			mv = mvList.mvs[i];
			if (MakeMove(mv)) 
			{
				value = MaxValue - ply;
			}
			else
			{
				value = -AlphaBetaSearch(depth -1, -beta, -alpha);
			}			
			UnMakeMove();
			if(value >= beta)
			{
				SaveGoodMove(mv, depth, ply);
				SaveHashTable(value,depth,hashBETA,mv);
				return value;
			}							
			if (value > best) 
			{
				best = value;
				if(value > alpha)
				{
					goodmove = mv;
					alphaFlag = 0;
					alpha = value;
					if(depth == MaxDepth)
						BestMove = mv;			
				}
			}			
		}
		if (alphaFlag == 1)
		{
			SaveHashTable(best,depth,hashALPHA,goodmove);	
		}
		else
		{
			SaveGoodMove(goodmove, depth, ply);
			SaveHashTable(best,depth,hashEXACT,goodmove);	
		}		
		return best;
	}
}

void CBoard::ComputerThinkTimer(int TimeLimit)
{
	long bestmove;
	BestMove.from = 0;
	BestMove.to = 0;

	move BackupMove;  //每层最佳着法
	TotalMoveNum++;

	//  从开局库中搜索着法
	BackupMove = GetBookMove();
	if (BackupMove != NULL_MOVE) 
	{
		bestmove = BackupMove.Coord();
		printf("bestmove %.4s\n", (const char *) &bestmove);
		fflush(stdout);
		return ;
	}
	
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
	sg_TimeStart  = GetTickCount();
	sg_TimeOut = 0;
	
	StackTop = 0;
	ply =0;
	sg_DepthTimer = 1;

	memset(&BestMove,0,sizeof(BestMove));		//清空走法
	memset(g_KillerMove, 0, sizeof(g_KillerMove));	//清空杀手着法
	memset(g_History, 0, sizeof(g_History));	//清空历史表着法
	BackupMove = BestMove; 

	for(MaxDepth=1; MaxDepth<20;MaxDepth++)
	{
		AlphaBetaSearch(MaxDepth,-MaxValue, MaxValue);
		if(sg_TimeOut)
			break;
		else
			BackupMove = BestMove; 
	}

	printf("max depth =%d\n", MaxDepth);
	fflush(stdout);
	if (BackupMove.from == 0)//无着法			
	{
		printf("nobestmove\n");	//认输
		fflush(stdout);
	}
	else
	{
		bestmove = BackupMove.Coord();
		printf("bestmove %.4s\n", (const char *) &bestmove);
		fflush(stdout);
	}

	ClearHashTable();
	
}

void CBoard::ComputerThinkDepth(int depth)
{
	BestMove.from = 0;
	BestMove.to = 0;

	move BackupMove;  //每层最佳着法
	long bestmove;
	TotalMoveNum++;
	BackupMove = GetBookMove();
	if (BackupMove != NULL_MOVE) 
	{
		bestmove = BackupMove.Coord();
		printf("bestmove %.4s\n", (const char *) &bestmove);
		fflush(stdout);
		return ;
	}
	
	StackTop = 0;
	ply =0;

	memset(&BestMove,0,sizeof(BestMove));		//清空走法
	BackupMove = BestMove; 

	MaxDepth = depth;
	sg_DepthTimer = 0;
	AlphaBetaSearch(MaxDepth,-MaxValue, MaxValue);
	BackupMove = BestMove; 

	if (BackupMove.from == 0)//无着法			
	{
		printf("nobestmove\n");	//认输
		fflush(stdout);
	}
	else
	{
		bestmove = BackupMove.Coord();
		printf("bestmove %.4s\n", (const char *) &bestmove);
		fflush(stdout);
	}

	g_Board.ClearHashTable();
	
}