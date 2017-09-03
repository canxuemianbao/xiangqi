#include "memory.h"
#include "Board.h"


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
	p = MoveStack[StackTop].capture;

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

int CBoard::AlphaBetaSearch(int depth, int alpha, int beta)	// Alpha-Beta搜索算法
{
	int value;
	move MoveArray[128];
	move mv;
	int i;

	value = ReadHashTable();
	if (value != NOVALUE) 
	{
		return value;
	}
	if(depth ==0)
	{
		value = Eval();
		SaveHashTable(value);
		return value;
	}

	int num = GenAllMove(MoveArray);
	for(i = 0 ; i<num; i++)
	{
		mv = MoveArray[i];
		MakeMove(mv);
		value = -AlphaBetaSearch(depth -1, -beta, -alpha);
		UnMakeMove();
		if(value >= beta)
		{
			SaveHashTable(beta);
			return beta;
		}		
		if(value > alpha)
		{
			alpha = value;
			SaveHashTable(alpha);		
			if(depth == MaxDepth)
				BestMove = mv;			
		}
	}
	return alpha;
}

void CBoard::ComputerThink()
{
	BestMove.from = 0;
	BestMove.to = 0;

	long bestmove;
	StackTop = 0;
	ply =0;
	MaxDepth = 5;

	memset(&BestMove,0,sizeof(BestMove));		//清空走法

	AlphaBetaSearch(MaxDepth,-MaxValue, MaxValue);

	if (BestMove.from == 0)//无着法			
	{
		printf("nobestmove\n");	//认输
	}
	else
	{
		bestmove = BestMove.Coord();
		printf("bestmove %.4s\n", (const char *) &bestmove);
	}

	g_Board.ClearHashTable();
	fflush(stdout);
	
}