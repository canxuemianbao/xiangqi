#include <stdio.h>
#include <conio.h>

//---------------变量声明-----------------------------------------------
int side;					// 轮到哪方走，0表示红方，1表示黑方
unsigned char board[256];	// 棋盘数组
char FenString[128];		//局面的FEN串格式

//---------------函数声明-----------------------------------------------
void ClearBoard();		//清空棋盘数组
void OutputBoard();		//输出棋盘数组
char IntToChar(int a);	//棋子整数值转换成字符值
int CharToSubscript(char ch); //FEN串中棋子对应的数组下标
	//下标0，1，2，3，4，5，6分别对应表示将，仕，象，马，车，炮，兵

void StringToArray(const char *FenStr); //将FEN串表示的局面转换成一维数组
void ArrayToString();	// 将一维数组表示的局面转换成FEN串


//----------------------------------------------------------------------
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
void main()
{
	printf("****************************************************************\n");
	printf(" 示例程序3-1       局面表示  一维数组与FEN串相互转换 \n");
	printf("\n");
	printf("                         作者：蒋鹏\n");
	printf("                         时间：2007-8-28\n");
	printf("****************************************************************\n");
	printf("FEN串转换为一维数组\n");
	StringToArray("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1");
	OutputBoard();
	printf("一维数组转换为FEN串\n");
	ArrayToString();
	printf("%s\n",FenString);
	getch();
}