// Board.cpp: implementation of the CBoard class.
//
//////////////////////////////////////////////////////////////////////

#include "Board.h"

#ifdef _DEBUG
#undef THIS_FILE
static char THIS_FILE[]=__FILE__;
#define new DEBUG_NEW
#endif


CBoard g_Board;

//////////////////////////////////////////////////////////////////////
// Construction/Destruction
//////////////////////////////////////////////////////////////////////


CBoard::CBoard()
{
	StackTop = 0;
	ply =0;
	MaxDepth = 4;
}

CBoard::~CBoard()
{

}


//��������ֵת�����ַ���ʾ
char CBoard::IntToChar(int a)
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

void CBoard::ClearBoard() //�����������
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
	StackTop=0;
	ZobristKey = 0;
	ZobristKeyCheck = 0;
}

//FEN�������Ӷ�Ӧ�������±�
//�±�0��1��2��3��4��5��6�ֱ��Ӧ��ʾ�����ˣ����������ڣ���
int CBoard::CharToSubscript(char ch) 
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

void CBoard::AddPiece(int pos, int pc) //��������
{
	int pt;
	board[pos] = pc;
	piece[pc] = pos;
	pt = PieceNumToType[pc];
	if (pc>=32)
	{
		pt += 7;
	}
	ZobristKey ^= ZobristTable[pt][pos];
	ZobristKeyCheck ^= ZobristTableCheck[pt][pos];
}

//��FEN����ʾ�ľ���ת����һά����
void CBoard::StringToArray(const char *FenStr) 
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

// ��һά�����ʾ�ľ���ת����FEN��
void CBoard::ArrayToString()
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

//�����������
void CBoard::OutputBoard()
{
	for(int i=1; i<=256; i++)
	{
		printf("%3d",board[i-1]);
		if(i%16==0)
			printf("\n");
	}
}

//�����������
void CBoard::OutputPiece()
{
	int i;
	printf("��������\n");
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
