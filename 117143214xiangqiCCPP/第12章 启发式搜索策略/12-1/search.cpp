#include <memory.h>
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
static int sg_DepthTimer;	//�����/ʱ������ = 1 ʱ�� =0���

void CBoard::ChangeSide()
{
	side = 1- side;
	ZobristKey ^= ZobristPlayer;
	ZobristKeyCheck ^= ZobristPlayerCheck;
}

bool  CBoard::MakeMove(move m)
{
	unsigned char from, dest, p;
	int SideTag = (side==0 ? 32:16);	//�˴�Ϊ�Է���˧��ֵ�������ط����ʾ������˧ֵ
	int pt;
	int pc;

	from = m.from; 
	dest = m.to;
	
	//�����߷�ջ
	MoveStack[StackTop].from = from; 
	MoveStack[StackTop].to = dest; 
	MoveStack[StackTop].capture = p = board[dest]; 
	StackTop++; 

	//������������
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

	//������������
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

	//������������
	pc = board[from] = board[dest];
	board[dest] = p;

	pt = PieceNumToType[pc];
	if (pc>=32) 
	{
		pt += 7;
	}
	ZobristKey ^= ZobristTable[pt][from] ^ ZobristTable[pt][dest];
	ZobristKeyCheck ^= ZobristTableCheck[pt][from] ^ ZobristTableCheck[pt][dest];

	//������������
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

int CBoard::AlphaBetaSearch(int depth, int alpha, int beta)	// Alpha-Beta�����㷨
{
	int value,best;
	move MoveArray[128];
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
		value = Eval();
		SaveHashTable(value,depth,hashEXACT,NULL_MOVE);
		return value;
	}		
	else
	{	
		int num;
		if (memcmp(&mv,&NULL_MOVE,sizeof(move))) 
		{
			MoveArray[0] = mv;
			num = GenCapMove(MoveArray+1);
			num = num + GenNonCapMove(MoveArray+1+num);
			num += 1;
		}
		else
		{
			num = GenCapMove(MoveArray);
			num = num + GenNonCapMove(MoveArray+num);
		}		
		for(i = 0 ; i<num; i++)
		{
			mv = MoveArray[i];
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
				SaveHashTable(value,depth,hashBETA,MoveArray[i]);
				return value;
			}							
			if (value > best) 
			{
				best = value;
				goodmove = MoveArray[i];
				if(value > alpha)
				{
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
			SaveHashTable(best,depth,hashEXACT,goodmove);	
		}		
		return best;
	}
}


void CBoard::ComputerThinkTimer(int TimeLimit)
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
	sg_DepthTimer = 1;
	
	long bestmove;
	StackTop = 0;
	ply =0;

	memset(&BestMove,0,sizeof(BestMove));		//����߷�
	BackupMove = BestMove; 

	for(MaxDepth=1; MaxDepth<20;MaxDepth++)
	{
		AlphaBetaSearch(MaxDepth,-MaxValue, MaxValue);
		if(sg_TimeOut)
			break;
		else
			BackupMove = BestMove; 
	}

	if (BackupMove.from == 0)//���ŷ�			
	{
		printf("nobestmove\n");	//����
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
void CBoard::ComputerThinkDepth(int depth)
{
	BestMove.from = 0;
	BestMove.to = 0;

	move BackupMove;  //ÿ������ŷ�
	
	long bestmove;
	StackTop = 0;
	ply =0;
	TotalMoveNum++;

	memset(&BestMove,0,sizeof(BestMove));		//����߷�
	BackupMove = BestMove; 

	MaxDepth = depth;
	sg_DepthTimer = 0;
	AlphaBetaSearch(MaxDepth,-MaxValue, MaxValue);
	BackupMove = BestMove; 

	if (BackupMove.from == 0)//���ŷ�			
	{
		printf("nobestmove\n");	//����
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