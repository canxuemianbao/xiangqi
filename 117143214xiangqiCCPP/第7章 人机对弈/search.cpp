
#include "stdafx.h"
#include "Board.h"


void CBoard::ChangeSide()
{
	side = 1- side;
}

bool  CBoard::MakeMove(move m)
{
	unsigned char from, dest, p;
	int SideTag = (side==0 ? 32:16);	//�˴�Ϊ�Է���˧��ֵ�������ط����ʾ������˧ֵ

	from = m.from; 
	dest = m.to;
	
	//�����߷�ջ
	MoveStack[StackTop].from = from; 
	MoveStack[StackTop].to = dest; 
	MoveStack[StackTop].capture = p = board[dest]; 
	StackTop++; 

	//������������
	if(p>0)
		piece[p] = 0;
	piece[board[from]] = dest;

	//������������
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

	//������������
	board[from] = board[dest];
	board[dest] = p;

	//������������
	if(p>0)
		piece[p] = dest;
	piece[board[from]] = from;
	
}

int CBoard::AlphaBetaSearch(int depth, int alpha, int beta)	// Alpha-Beta�����㷨
{
	int value;
	move MoveArray[128];
	move mv;
	int i;

	if(depth ==0)
		return Eval();

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

void CBoard::ComputerThink()
{
	BestMove.from = 0;
	BestMove.to = 0;

	StackTop = 0;
	ply =0;
	MaxDepth = 4;
	AlphaBetaSearch(MaxDepth,-MaxValue, MaxValue);
}