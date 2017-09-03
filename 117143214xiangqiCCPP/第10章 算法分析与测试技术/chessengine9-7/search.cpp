#include "memory.h"
#include "Board.h"


static struct  
{
	unsigned long Counter;
	unsigned long AlphaNodes;
	unsigned long BetaNodes;
	unsigned long PvNodes;
	unsigned long EvalNodes;
	unsigned long HashNodes;
	unsigned long DeadNodes;
}sg_SearchNode;

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
	int value,best;
	move MoveArray[128];
	move mv,goodmove;
	int i;
	mv = goodmove = NULL_MOVE;
	value = ReadHashTable(depth,alpha,beta,mv);

	if (value != NOVALUE) 
	{
		sg_SearchNode.HashNodes++;
		return value;
	}
	
	best = -MaxValue;
	int alphaFlag = 1;

	if(depth <=0)
	{
		value = Eval();
		SaveHashTable(value,depth,hashEXACT,NULL_MOVE);
		sg_SearchNode.EvalNodes++;
		return value;
	}		
	else
	{	

		sg_SearchNode.Counter++;
		int num;
		if (mv.from!=0 && mv.to!=0) 
		{
			MoveArray[0] = mv;
			num = GenAllMove(MoveArray+1);
			num += 1;
		}
		else
		{
			num = GenAllMove(MoveArray);
		}	
		if(num<1)
		{
			sg_SearchNode.DeadNodes++;
			return -MaxValue + ply;
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
 				sg_SearchNode.BetaNodes++;
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
			sg_SearchNode.AlphaNodes ++;
			SaveHashTable(best,depth,hashALPHA,goodmove);	
		}
		else
		{
			sg_SearchNode.PvNodes ++;
			SaveHashTable(best,depth,hashEXACT,goodmove);	
		}		
		return best;
	}
}

void CBoard::ComputerThink(int depth)
{
	BestMove.from = 0;
	BestMove.to = 0;

	long bestmove;
	StackTop = 0;
	ply =0;
	MaxDepth = depth;

	memset(&BestMove,0,sizeof(BestMove));		//清空走法
	memset(&sg_SearchNode,0,sizeof(sg_SearchNode));		//清空统计数据

	AlphaBetaSearch(MaxDepth,-MaxValue, MaxValue);

	FILE *fp;
	fp = fopen("e:\\测试用例.txt","a");
	fprintf(fp,"---------结合置换表的AlphaBeta搜索 -------------\n");
	fprintf(fp,"depth = %d, bestmove = from %d to %d\n\n",MaxDepth,BestMove.from,BestMove.to);
	fprintf(fp,"    Counter      = %lu\n",sg_SearchNode.Counter);
	fprintf(fp,"    EvalNodes    = %lu\n",sg_SearchNode.EvalNodes);
	fprintf(fp,"    BetaNodes    = %lu\n",sg_SearchNode.BetaNodes);
	fprintf(fp,"    PvNodes      = %lu\n",sg_SearchNode.PvNodes);
	fprintf(fp,"    AlphaNodes   = %lu\n",sg_SearchNode.AlphaNodes);
	fprintf(fp,"    HsahNodes    = %lu\n",sg_SearchNode.HashNodes);
	fprintf(fp,"    DeadNodes    = %lu\n",sg_SearchNode.DeadNodes);
	if (BestMove.from == 0)//无着法			
	{
		printf("nobestmove\n");	//认输
		fprintf(fp,"nobestmove\n");	//认输
	}
	else
	{
		bestmove = BestMove.Coord();
		printf("bestmove %.4s\n", (const char *) &bestmove);
		fprintf(fp,"bestmove %.4s\n", (const char *) &bestmove);
	}

	g_Board.ClearHashTable();
	fflush(stdout);
	fclose(fp);
	
}