#include <stdio.h>
#include <conio.h>

//************************************************************************
//                  变量声明
//************************************************************************

int side;					// 轮到哪方走，0表示红方，1表示黑方
unsigned char board[256];	// 棋盘数组
unsigned char piece[48];	// 棋子数组
char FenString[128];		// 局面的FEN串格式

typedef struct {
	unsigned char  from, to;
	unsigned char  capture;
}move;
move MoveStack[128];	// 执行的走法栈
int StackTop;			// 栈顶指针,指向栈顶元素的下一位置,=0表示栈空
move BestMove;	//搜索得到的最佳走法
int ply;		// 当前搜索深度
int MaxDepth;	//最大搜索深度
const int MaxValue = 3000;	//估值最大值

//************************************************************************
//                  函数声明
//************************************************************************

// 局面表示相关函数------------------------------------
void ClearBoard();				// 清空棋盘数组
void OutputBoard();				// 输出棋盘数组
void OutputPiece();				// 输出棋子数组
char IntToChar(int a);			// 棋子整数值转换成字符值
int CharToSubscript(char ch);	// FEN串中棋子对应的数组下标
	//下标0，1，2，3，4，5，6分别对应表示将，仕，象，马，车，炮，兵

void AddPiece(int pos, int pc);			// 在pos位置增加棋子pc
void StringToArray(const char *FenStr); // 将FEN串表示的局面转换成一维数组
void ArrayToString();					// 将一维数组表示的局面转换成FEN串

// 走法生成辅助函数-----------------------------------
int SaveMove(unsigned char from, unsigned char to,move * mv);//保存生成的走法,成功返回1，失败返回0
int GenAllMove(move * MoveArray);	//生成所有的走法
void OutputMove(move * MoveArray, int MoveNum);//输出所有的走法
int Check(int lSide);		//检测lSide一方是否被将军，是被将军返回1，否则返回0


// 评估函数 ------------------------------------------
short Eval();				// 评估函数
int IntToSubscript(int a);	// 棋子整数值转换成下标
	//下标0，1，2，3，4，5，6分别对应表示将，仕，象，马，车，炮，兵

// 搜索函数------------------------------------------
void MinMaxSearch();	// 极大极小搜索算法
bool MakeMove(move m);	// 执行走法
void UnMakeMove();		// 撤消走法
void ChangeSide();		// 交换走棋方


//************************************************************************
//                  辅助数组
//************************************************************************

// 评估辅助数组
const short PieceValue[8]={1000,20,20,40,90,45,10,0}; //棋子价值表

//各种棋子走法数组
short KingDir[8] ={-0x10,		-0x01,	+0x01,	+0x10,	0,		0,		0,		0},//将
	AdvisorDir[8]={-0x11,		-0x0f,	+0x0f,	+0x11,	0,		0,		0,		0},		//士
	BishopDir[8] ={-0x22,		-0x1e,	+0x1e,	+0x22,	0,		0,		0,		0},	//象
	KnightDir[8] ={-0x21,		-0x1f,	-0x12,	-0x0e,	+0x0e,	+0x12,	+0x1f,	+0x21},	//马
	RookDir[8]   ={-0x01,		+0x01,	-0x10,	+0x10,	0,		0,		0,		0},		//车
	CannonDir[8] ={-0x01,		+0x01,	-0x10,	+0x10,	0,		0,		0,		0},		//炮
	PawnDir[2][8]={
			{-0x01,		+0x01,	-0x10,	0,		0,		0,		0,		0},
			{-0x01,		+0x01,	+0x10,	0,		0,		0,		0,		0}
		};		//兵

short KnightCheck[8] = {-0x10,-0x10,-0x01,+0x01,-0x01,+0x01,+0x10,+0x10};//马腿位置
short BishopCheck[8] = {-0x11,-0x0f,+0x0f,+0x11,0,0,0,0};	//象眼位置
short kingpalace[9] = {54,55,56,70,71,72,86,87,88};	//黑方九宫位置

//各种棋子合理位置数组
unsigned char LegalPosition[2][256] ={
	{
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
		0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
		0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
		0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
		0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
		0, 0, 0, 9, 1,25, 1, 9, 1,25, 1, 9, 0, 0, 0, 0,
		0, 0, 0, 9, 1, 9, 1, 9, 1, 9, 1, 9, 0, 0, 0, 0,
		0, 0, 0, 17, 1, 1, 7, 19, 7, 1, 1, 17, 0, 0, 0, 0,
		0, 0, 0, 1, 1, 1, 3, 7, 3, 1, 1, 1, 0, 0, 0, 0,
		0, 0, 0, 1, 1, 17, 7, 3, 7, 17, 1, 1, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	},
	{
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 1, 1, 17, 7, 3, 7, 17, 1, 1, 0, 0, 0, 0,
		0, 0, 0, 1, 1, 1, 3, 7, 3, 1, 1, 1, 0, 0, 0, 0,
		0, 0, 0, 17, 1, 1, 7, 19, 7, 1, 1, 17, 0, 0, 0, 0,
		0, 0, 0, 9, 1, 9, 1, 9, 1, 9, 1, 9, 0, 0, 0, 0,
		0, 0, 0, 9, 1,25, 1, 9, 1,25, 1, 9, 0, 0, 0, 0,
		0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
		0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
		0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
		0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
		0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	}
};
unsigned char PositionMask[7] = {2, 4, 16, 1, 1, 1, 8};


//************************************************************************
//                  函数实现
//************************************************************************

//棋子整数值转换成字符表示
char IntToChar(int a)
{
	if(a <32)
	{
		switch(a)
		{
		case 16:	return 'K';
		case 17:
		case 18:	return 'A';
		case 19:
		case 20:	return 'B';
		case 21:
		case 22:	return 'N';
		case 23:
		case 24:	return 'R';
		case 25:
		case 26:	return 'C';
		case 27:
		case 28:
		case 29:
		case 30:
		case 31:	return 'P';
		default:	return 0;
		}
	}
	else
	{
		a = a-16;
		switch(a)
		{
		case 16:	return 'k';
		case 17:
		case 18:	return 'a';
		case 19:
		case 20:	return 'b';
		case 21:
		case 22:	return 'n';
		case 23:
		case 24:	return 'r';
		case 25:
		case 26:	return 'c';
		case 27:
		case 28:
		case 29:
		case 30:
		case 31:	return 'p';
		default:	return 0;
		}
	}
}

void ClearBoard() //清空棋盘数组
{
	int i;
	side = 0;
	for (i = 0; i < 256; i ++) 
	{
		board[i] = 0;
	}
	for (i = 0; i < 48; i ++) 
	{
		piece[i] = 0;
	}
}

//FEN串中棋子对应的数组下标
//下标0，1，2，3，4，5，6分别对应表示将，仕，象，马，车，炮，兵
int CharToSubscript(char ch) 
{
	switch(ch)
	{
	case 'k':
	case 'K':return 0;
	case 'a':
	case 'A':return 1;
	case 'b':
	case 'B':return 2;
	case 'n':
	case 'N':return 3;
	case 'r':
	case 'R':return 4;
	case 'c':
	case 'C':return 5;
	case 'p':
	case 'P':return 6;
	default:return 7;
	}
}

void AddPiece(int pos, int pc) //增加棋子
{
	board[pos] = pc;
	piece[pc] = pos;
}

//将FEN串表示的局面转换成一维数组
void StringToArray(const char *FenStr) 
{
	int i, j, k;
	int pcWhite[7]={16,17,19,21,23,25,27};
	int pcBlack[7]={32,33,35,37,39,41,43};
	const char *str;
  
	ClearBoard();
	str = FenStr;
	if (*str == '\0') 
	{
		return;
	}
  
	i = 3;
	j = 3;
	while (*str != ' ') 
	{
		if (*str == '/') 
		{
			j = 3;
			i ++;
			if (i > 12) 
			{
				break;
			}
		} 
		else if (*str >= '1' && *str <= '9') 
		{
			for (k = 0; k < (*str - '0'); k ++) 
			{
				if (j >= 11) 
				{
					break;
				}
				j ++;
			}
		} 
		else if (*str >= 'A' && *str <= 'Z') 
		{
			if (j <= 11) 
			{
				k = CharToSubscript(*str);
				if (k < 7) 
				{
					if (pcWhite[k] < 32) 
					{
						AddPiece((i<<4)+j,pcWhite[k]);
						pcWhite[k]++;
					}
				}
				j ++;
			}
		}
		else if (*str >= 'a' && *str <= 'z') 
		{
			if (j <= 11) 
			{
				k = CharToSubscript(*str);
				if (k < 7) 
				{
					if (pcBlack[k] < 48) 
					{
						AddPiece((i<<4)+j,pcBlack[k]);
						pcBlack[k]++;
					}
				}
				j ++;
			}
		}
		
		str ++;
		if (*str == '\0') 
		{
			return;
		}
	}
  	str ++;
  
	if (*str == 'b') 
		side = 1;
	else
		side = 0;
}

// 将一维数组表示的局面转换成FEN串
void ArrayToString()
{
	int i, j, k, pc;
	char *str;

	str = FenString;
	for (i = 3; i <= 12; i ++) 
	{
		k = 0;
		for (j = 3; j <= 11; j ++) 
		{
			pc = board[(i << 4) + j];
			if (pc != 0) 
			{
				if (k > 0) 
				{
					*str = k + '0';
					str ++;
					k = 0;
				}
				*str = IntToChar(pc);
				str ++;
			} 
			else 
			{
				k ++;
			}
		}
		if (k > 0) 
		{
			*str = k + '0';
			str ++;
		}
		*str = '/';
		str ++;
	}
	str --;
	*str = ' ';
	str ++;
	*str = (side == 0 ? 'w' : 'b');
	str ++;
	*str = '\0';
}

//输出棋盘数组
void OutputBoard()
{
	for(int i=1; i<=256; i++)
	{
		printf("%3d",board[i-1]);
		if(i%16==0)
			printf("\n");
	}
}

//输出棋子数组
void OutputPiece()
{
	int i;
	printf("棋子数组\n");
	for(i=0;i<16;i++)
		printf("%4d",piece[i]);
	printf("\n");
	for(i=16;i<32;i++)
		printf("%4d",piece[i]);
	printf("\n");
	for(i=32;i<48;i++)
		printf("%4d",piece[i]);
	printf("\n");
}

//棋子整数值转换成字符表示
int IntToSubscript(int a)
{
	if(a<16 && a>=48)
		return 7;
	
	if(a >=32)
		a = a-16;

	switch(a)
	{
	case 16:	return 0;
	case 17:
	case 18:	return 1;
	case 19:
	case 20:	return 2;
	case 21:
	case 22:	return 3;
	case 23:
	case 24:	return 4;
	case 25:
	case 26:	return 5;
	case 27:
	case 28:
	case 29:
	case 30:
	case 31:	return 6;
	default:	return 7;
	}

}

short Eval(void)	//评估函数
{
	int i;
	short bValue,wValue;

	bValue = wValue = 0;
	for(i=16; i<32; i++)
	{
		if(piece[i]>0)
			wValue = wValue + PieceValue[IntToSubscript(i)];
	}

	for(i=32; i<48; i++)
	{
		if(piece[i]>0)
			bValue = bValue + PieceValue[IntToSubscript(i)];
	}

	return wValue - bValue;
}

int Check(int lSide)	//检测lSide一方是否被将军，是被将军返回1，否则返回0
{
	unsigned char wKing,bKing; //红黑双方将帅的位置
	unsigned char p,q;
	int r;	//r=1表示将军，否则为0
	int SideTag = 32 - lSide * 16;	//此处表示lSide对方的将的值
	int fSide = 1-lSide;	//对方标志
	int i;
	int PosAdd;	//位置增量

	wKing = piece[16];
	bKing = piece[32];
	if(!wKing || !bKing)
		return 0;

	//检测将帅是否照面
	r=1;
	if(wKing%16 == bKing%16)
	{
		for(wKing=wKing-16; wKing!=bKing; wKing=wKing-16)
		{
			if(board[wKing])	
			{
				r=0;
				break;
			}
		}
		if(r)
			return r;	//将帅照面
	}

	q = piece[48-SideTag];	//lSide方将的位置

	//检测将是否被马攻击
	int k;
	unsigned char n;//下一步可能行走的位置
	unsigned char m;//马腿位置
	
	for(i=5;i<=6;i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<8; k++)//8个方向
		{
			n = p + KnightDir[k];	//n为新的可能走到的位置
			if(n!=q)
				continue;

			if(LegalPosition[fSide][n] & PositionMask[3])	//马将对应下标为3
			{
				m = p + KnightCheck[k];
				if(!board[m])	//马腿位置无棋子占据
				{
					return 1;
				}
			}
		}
	}
	
	//检测将是否被车攻击
	r=1;
	for(i=7;i<=8;i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		if(p%16 == q%16)	//在同一纵线上
		{
			PosAdd = (p>q?-16:16);
			for(p=p+PosAdd; p!=q; p = p+PosAdd)
			{
				if(board[p])	//车将中间有子隔着
				{
					r=0;
					break;
				}
			}
			if(r)
				return r;
		}
		else if(p/16 ==q/16)	//在同一横线上
		{
			PosAdd = (p>q?-1:1);
			for(p=p+PosAdd; p!=q; p = p+PosAdd)
			{
				if(board[p])
				{
					r=0;
					break;
				}
			}
			if(r)
				return r;
		}
	}
	
	//检测将是否被炮攻击
	int OverFlag = 0;	//翻山标志
	for(i=9;i<=10;i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		if(p%16 == q%16)	//在同一纵线上
		{
			PosAdd = (p>q?-16:16);
			for(p=p+PosAdd; p!=q; p = p+PosAdd)
			{
				if(board[p])
				{
					if(!OverFlag)	//隔一子
						OverFlag = 1;
					else			//隔两子
					{
						OverFlag = 2;
						break;
					}
				}
			}
			if(OverFlag==1)
				return 1;
		}
		else if(p/16 ==q/16)	//在同一横线上
		{
			PosAdd = (p>q?-1:1);
			for(p=p+PosAdd; p!=q; p = p+PosAdd)
			{
				if(board[p])
				{
					if(!OverFlag)
						OverFlag = 1;
					else
					{
						OverFlag = 2;
						break;
					}
				}
			}
			if(OverFlag==1)
				return 1;
		}
	}

	//检测将是否被兵攻击
	for(i=11;i<=15;i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<3; k++)//3个方向
		{
			n = p + PawnDir[fSide][k];	//n为新的可能走到的位置
			if((n==q) && (LegalPosition[fSide][n] & PositionMask[6]))	//兵士将对应下标为6
			{
				return 1;
			}
		}
	}

	return 0;
}

int SaveMove(unsigned char from, unsigned char to,move * mv)
{
	unsigned char p;
	
	p = board[to];
	piece[board[from]] = to;
	if(p)
		piece[p]=0;
	board[to] = board[from];
	board[from] = 0;

	int r =Check(side);
	board[from] = board[to];
	board[to] = p;
	piece[board[from]] = from;
	if(p)
		piece[p] = to;

	if(!r)
	{
		mv->from = from;
		mv->to = to;
		return 1;
	}
	return 0;
}

int GenAllMove(move * MoveArray)
{
	short i,j,k;
	unsigned char p;	//p:棋子位置
	unsigned char n;	//下一步可能行走的位置
	unsigned char m;	//马腿、象眼位置
	int SideTag;		//走棋方，经方16，黑方32
	int OverFlag;		//炮的翻山标志
	move * mvArray = MoveArray;

	SideTag = 16 + 16 * side;
	
	p = piece[SideTag];	//将的位置
	if(!p)
		return 0;

	//将的走法
	for(k=0; k<4; k++)//4个方向
	{
		n = p + KingDir[k];	//n为新的可能走到的位置
		if(LegalPosition[side][n] & PositionMask[0])	//将对应下标为0
		{
			if( !(board[n] & SideTag))	//目标位置上没有本方棋子
				if(SaveMove(p, n, mvArray))
					mvArray++;
		}
	}

	//士的走法
	for(i=1; i<=2; i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<4; k++)//4个方向
		{
			n = p + AdvisorDir[k];	//n为新的可能走到的位置
			if(LegalPosition[side][n] & PositionMask[1])	//士将对应下标为1
			{
				if( !(board[n] & SideTag))	//目标位置上没有本方棋子
					if(SaveMove(p, n, mvArray))
						mvArray++;
			}
		}
	}

	//象的走法
	for(i=3; i<=4; i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<4; k++)//4个方向
		{
			n = p + BishopDir[k];	//n为新的可能走到的位置
			if(LegalPosition[side][n] & PositionMask[2])	//象将对应下标为2
			{
				m = p + BishopCheck[k];
				if(!board[m])	//象眼位置无棋子占据
				{
					if( !(board[n] & SideTag))	//目标位置上没有本方棋子
						if(SaveMove(p, n, mvArray))
							mvArray++;
				}
			}
		}
	}
	
	//马的走法
	for(i=5; i<=6; i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<8; k++)//8个方向
		{
			n = p + KnightDir[k];	//n为新的可能走到的位置
			if(LegalPosition[side][n] & PositionMask[3])	//马将对应下标为3
			{
				m = p + KnightCheck[k];
				if(!board[m])	//马腿位置无棋子占据
				{
					if( !(board[n] & SideTag))	//目标位置上没有本方棋子
						if(SaveMove(p, n, mvArray))
							mvArray++;
				}
			}
		}
	}

	//车的走法
	for(i=7; i<=8; i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<4; k++)	//4个方向
		{
			for(j=1; j<10; j++)	//横的最多有8个可能走的位置，纵向最多有9个位置
			{
				n = p + j * RookDir[k];
				if(!(LegalPosition[side][n] & PositionMask[4]))	//车士将对应下标为4
					break;//不合理的位置
				if(! board[n] )	//目标位置上无子
				{
					if(SaveMove(p, n, mvArray))
						mvArray++;
				}
				else if ( board[n] & SideTag)	//目标位置上有本方棋子
					break;
				else	//目标位置上有对方棋子
				{
					if(SaveMove(p, n, mvArray))
						mvArray++;
					break;
				}
			}
		}
	}

	//炮的走法
	for(i=9; i<=10; i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<4; k++)	//4个方向
		{
			OverFlag = 0;
			for(j=1; j<10; j++)	//横的最多有8个可能走的位置，纵向最多有9个位置
			{
				n = p + j * CannonDir[k];
				if(!(LegalPosition[side][n] & PositionMask[5]))	//炮士将对应下标为5
					break;//不合理的位置
				if(! board[n] )	//目标位置上无子
				{
					if(!OverFlag)	//未翻山
						if(SaveMove(p, n, mvArray))
							mvArray++;
					//已翻山则不作处理，自动考察向下一个位置
				}
				else//目标位置上有子
				{
					if (!OverFlag)	//未翻山则置翻山标志
						OverFlag = 1;
					else	//已翻山
					{
						if(! (board[n] & SideTag))//对方棋子
							if(SaveMove(p, n, mvArray))
								mvArray++;
						break;	//不论吃不吃子，都退出此方向搜索
					}
				}
			}
		}	
	}

	//兵的走法
	for(i=11; i<=15; i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<3; k++)//3个方向
		{
			n = p + PawnDir[side][k];	//n为新的可能走到的位置
			if(LegalPosition[side][n] & PositionMask[6])	//兵士将对应下标为6
			{
				if( !(board[n] & SideTag))	//目标位置上没有本方棋子
					if(SaveMove(p, n, mvArray))
						mvArray++;
			}
		}
	}
	return mvArray - MoveArray;
}

void OutputMove(move * MoveArray, int MoveNum)
{
	int i;
	for(i=0; i<MoveNum; i++)
	{
		printf("from %3d to %3d\n",MoveArray[i].from,MoveArray[i].to);
	}
	printf("total move number:%d\n",MoveNum);
}

void ChangeSide()
{
	side = 1- side;
}

bool  MakeMove(move m)
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

void UnMakeMove(void)
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

int MinMaxSearch(int depth)	// 极大极小搜索算法
{
	int best,value;
	move MoveArray[128];
	move mv;
	int i;

	if(side)
		best = MaxValue;
	else
		best = -MaxValue;

	if(depth ==0)
		return Eval();

	int num = GenAllMove(MoveArray);
	for(i = 0 ; i<num; i++)
	{
		mv = MoveArray[i];
		MakeMove(mv);
		value = MinMaxSearch(depth -1);
		UnMakeMove();
		if(side)
		{
			if(value < best)
			{
				best = value;
				if(depth == MaxDepth)
					BestMove = mv;
			}
		}
		else
		{
			if(value > best)
			{
				best = value;
				if(depth == MaxDepth)
					BestMove = mv;
			}
		}
	}
	return best;
}

void main()
{
	printf("****************************************************************\n");
	printf(" 示例程序6-1             极大极小搜索算法\n");
	printf("\n");
	printf("                                作者：蒋鹏\n");
	printf("                                时间：2008-6-12\n");
	printf("****************************************************************\n");
	printf("初始局面\n");
	StringToArray("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1");
	OutputBoard();

	OutputPiece();

	MaxDepth = 4;
	StackTop = 0;
	MinMaxSearch(MaxDepth);
	printf("\n***   极大极小搜索算法   ***\n");
	printf("最佳走法: from %d to %d \n",BestMove.from,BestMove.to);

	getch();
}