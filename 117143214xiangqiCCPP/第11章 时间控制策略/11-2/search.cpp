
#include "Board.h"
#include <windows.h>

static unsigned long sg_TimeStart;	//ÿ����������ʼʱ�� 
static unsigned int sg_TimeLimit =0;	//ÿ��������ʱ��
static int sg_FirstMoveNum = 50;
static int sg_SecondMoveNum = 60;
static int sg_ThirdMoveNum = 80;
static int sg_FirstTimeLimit = 60;
static int sg_SecondTimeLimit = 80;
static int sg_ThirdTimeLimit = 100;
static int sg_TimeOut;		//ʱ�䳬���ı���

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
	move BackupMove;  //ÿ������ŷ�
	
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