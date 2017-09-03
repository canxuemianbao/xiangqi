#include <stdio.h>
#include <conio.h>

//---------------变量声明-----------------------------------------------
int side;					// 轮到哪方走，0表示红方，1表示黑方
unsigned char board[256];	// 棋盘数组
char FenString[128];		//局面的FEN串格式

typedef struct {
	unsigned char  from, to;
}move;
move MoveArray[128];//走法数组
int MoveNum;	//走法总数，从1计数

//---------------函数声明-----------------------------------------------
//局面表示相关函数
void ClearBoard();		//清空棋盘数组
void OutputBoard();		//输出棋盘数组
char IntToChar(int a);	//棋子整数值转换成字符值
int CharToSubscript(char ch); //FEN串中棋子对应的数组下标
	//下标0，1，2，3，4，5，6分别对应表示将，仕，象，马，车，炮，兵

void StringToArray(const char *FenStr); //将FEN串表示的局面转换成一维数组
void ArrayToString();	// 将一维数组表示的局面转换成FEN串

//棋子走法生成函数
void KingMove(unsigned char p);		//将的走法生成
void AdvisorMove(unsigned char p);	//士的走法生成
void BishopMove(unsigned char p);	//象的走法生成
void KnightMove(unsigned char p);	//马的走法生成
void RookMove(unsigned char p);		//车的走法生成
void CannonMove(unsigned char p);	//炮的走法生成	
void PawnMove(unsigned char p);		//兵的走法生成

//走法生成辅助函数
void InitGen();		//走法生成前的初始化操作
void SaveMove(unsigned char from, unsigned char t0);	//保存生成的走法
void GenAllMove();	//生成所有的走法
void OutputMove();	//输出所有的走法


//----------------走法生成相关辅助数组---------------------------------------------
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

//--------------------函数实现----------------------------------

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
						board[(i<<4) + j] = pcWhite[k];
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
						board[(i<<4) + j] = pcBlack[k];
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

void InitGen()
{
	MoveNum = 0;
}

void SaveMove(unsigned char from, unsigned char to)
{
	MoveArray[MoveNum].from = from;
	MoveArray[MoveNum].to = to;
	MoveNum++;
}

void KingMove(unsigned char p)
{
	int k;
	unsigned char n;//下一步可能行走的位置
	int SideTag = 16 + side * 16;	//走棋方，红方16，黑方32
	for(k=0; k<4; k++)//4个方向
	{
		n = p + KingDir[k];	//n为新的可能走到的位置
		if(LegalPosition[side][n] & PositionMask[0])	//将对应下标为0
		{
			if( !(board[n] & SideTag))	//目标位置上没有本方棋子
				SaveMove(p, n);
		}
	}
}

void AdvisorMove(unsigned char p)
{
	int k;
	unsigned char n;//下一步可能行走的位置
	int SideTag = 16 + side * 16;	//走棋方，红方16，黑方32
	for(k=0; k<4; k++)//4个方向
	{
		n = p + AdvisorDir[k];	//n为新的可能走到的位置
		if(LegalPosition[side][n] & PositionMask[1])	//士将对应下标为1
		{
			if( !(board[n] & SideTag))	//目标位置上没有本方棋子
				SaveMove(p, n);
		}
	}
}
void BishopMove(unsigned char p)
{
	int k;
	unsigned char n;//下一步可能行走的位置
	unsigned char m;//象眼位置
	int SideTag = 16 + side * 16;	//走棋方，红方16，黑方32
	for(k=0; k<4; k++)//4个方向
	{
		n = p + BishopDir[k];	//n为新的可能走到的位置
		if(LegalPosition[side][n] & PositionMask[2])	//象将对应下标为2
		{
			m = p + BishopCheck[k];
			if(!board[m])	//象眼位置无棋子占据
			{
				if( !(board[n] & SideTag))	//目标位置上没有本方棋子
					SaveMove(p, n);
			}
		}
	}
}
void KnightMove(unsigned char p)
{
	int k;
	unsigned char n;//下一步可能行走的位置
	unsigned char m;//马腿位置
	int SideTag = 16 + side * 16;	//走棋方，红方16，黑方32
	for(k=0; k<8; k++)//8个方向
	{
		n = p + KnightDir[k];	//n为新的可能走到的位置
		if(LegalPosition[side][n] & PositionMask[3])	//马将对应下标为3
		{
			m = p + KnightCheck[k];
			if(!board[m])	//马腿位置无棋子占据
			{
				if( !(board[n] & SideTag))	//目标位置上没有本方棋子
					SaveMove(p, n);
			}
		}
	}
}
void RookMove(unsigned char p)
{
	int k,j;
	unsigned char n;//下一步可能行走的位置
	int SideTag = 16 + side * 16;	//走棋方，红方16，黑方32
	for(k=0; k<4; k++)	//4个方向
	{
		for(j=1; j<10; j++)	//横的最多有8个可能走的位置，纵向最多有9个位置
		{
			n = p + j * RookDir[k];
			if(!(LegalPosition[side][n] & PositionMask[4]))	//车士将对应下标为4
				break;//不合理的位置
			if(! board[n] )	//目标位置上无子
				SaveMove(p, n);
			else if ( board[n] & SideTag)	//目标位置上有本方棋子
				break;
			else	//目标位置上有对方棋子
			{
				SaveMove(p, n);
				break;
			}
		}
	}
}
void CannonMove(unsigned char p)
{
	int k,j;
	unsigned char n;//下一步可能行走的位置
	int SideTag = 16 + side * 16;	//走棋方，红方16，黑方32
	int OverFlag;

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
					SaveMove(p, n);
				//已翻山则不作处理，自动考察向下一个位置
			}
			else//目标位置上有子
			{
				if (!OverFlag)	//未翻山则置翻山标志
					OverFlag = 1;
				else	//已翻山
				{
					if(! (board[n] & SideTag))//对方棋子
						SaveMove(p, n);
					break;	//不论吃不吃子，都退出此方向搜索
				}
			}
		}
	}
}
void PawnMove(unsigned char p)
{
	int k;
	unsigned char n;//下一步可能行走的位置
	int SideTag = 16 + side * 16;	//走棋方，红方16，黑方32
	for(k=0; k<3; k++)//3个方向
	{
		n = p + PawnDir[side][k];	//n为新的可能走到的位置
		if(LegalPosition[side][n] & PositionMask[6])	//兵士将对应下标为6
		{
			if( !(board[n] & SideTag))	//目标位置上没有本方棋子
				SaveMove(p, n);
		}
	}
}
void GenAllMove()
{
	short i, j;
	unsigned char p;	//p:棋子位置
	int SideTag;	//走棋方，经方16，黑方32

	SideTag = 16 + side * 16;

	for(i=3; i<13; i++)	//10行
	{
		for(j=3; j<12; j++) //9列
		{
			p=(i<<4)+j;	//棋子位置
			if( !(board[p] & SideTag)) //对方的棋子
				continue;	
			switch(board[p] - SideTag)
			{
			case 0:	//将
				KingMove(p);
				break;
			case 1:	//仕
			case 2:
				AdvisorMove(p);
				break;
			case 3:	//相
			case 4:
				BishopMove(p);
				break;
			case 5:	//马
			case 6:
				KnightMove(p);
				break;
			case 7:	//车
			case 8:
				RookMove(p);
				break;
			case 9:	//炮
			case 10:
				CannonMove(p);
				break;
			case 11://兵
			case 12:
			case 13:	
			case 14:
			case 15:
				PawnMove(p);
				break;
			}
		}
	}
}

void OutputMove()
{
	int i;
	for(i=0; i<MoveNum; i++)
	{
		printf("from %3d to %3d\n",MoveArray[i].from,MoveArray[i].to);
	}
	printf("total move number:%d\n",MoveNum);
}

void main()
{
	printf("****************************************************************\n");
	printf(" 示例程序4-2             走 法 生 成\n");
	printf("\n");
	printf("                         作者：蒋鹏\n");
	printf("                         时间：2007-8-29\n");
	printf("****************************************************************\n");
	printf("初始局面\n");
	StringToArray("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1");
	OutputBoard();

	printf("生成的走法\n");
	InitGen();
	GenAllMove();
	OutputMove();

	getch();
}