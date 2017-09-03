#include <stdio.h>
#include <conio.h>

//---------------��������-----------------------------------------------
int side;					// �ֵ��ķ��ߣ�0��ʾ�췽��1��ʾ�ڷ�
unsigned char board[256];	// ��������
char FenString[128];		//�����FEN����ʽ

typedef struct {
	unsigned char  from, to;
}move;
move MoveArray[128];//�߷�����
int MoveNum;	//�߷���������1����

//---------------��������-----------------------------------------------
//�����ʾ��غ���
void ClearBoard();		//�����������
void OutputBoard();		//�����������
char IntToChar(int a);	//��������ֵת�����ַ�ֵ
int CharToSubscript(char ch); //FEN�������Ӷ�Ӧ�������±�
	//�±�0��1��2��3��4��5��6�ֱ��Ӧ��ʾ�����ˣ����������ڣ���

void StringToArray(const char *FenStr); //��FEN����ʾ�ľ���ת����һά����
void ArrayToString();	// ��һά�����ʾ�ľ���ת����FEN��

//�����߷����ɺ���
void KingMove(unsigned char p);		//�����߷�����
void AdvisorMove(unsigned char p);	//ʿ���߷�����
void BishopMove(unsigned char p);	//����߷�����
void KnightMove(unsigned char p);	//����߷�����
void RookMove(unsigned char p);		//�����߷�����
void CannonMove(unsigned char p);	//�ڵ��߷�����	
void PawnMove(unsigned char p);		//�����߷�����

//�߷����ɸ�������
void InitGen();		//�߷�����ǰ�ĳ�ʼ������
void SaveMove(unsigned char from, unsigned char t0);	//�������ɵ��߷�
void GenAllMove();	//�������е��߷�
void OutputMove();	//������е��߷�


//----------------�߷�������ظ�������---------------------------------------------
//���������߷�����
short KingDir[8] ={-0x10,		-0x01,	+0x01,	+0x10,	0,		0,		0,		0},//��
	AdvisorDir[8]={-0x11,		-0x0f,	+0x0f,	+0x11,	0,		0,		0,		0},		//ʿ
	BishopDir[8] ={-0x22,		-0x1e,	+0x1e,	+0x22,	0,		0,		0,		0},	//��
	KnightDir[8] ={-0x21,		-0x1f,	-0x12,	-0x0e,	+0x0e,	+0x12,	+0x1f,	+0x21},	//��
	RookDir[8]   ={-0x01,		+0x01,	-0x10,	+0x10,	0,		0,		0,		0},		//��
	CannonDir[8] ={-0x01,		+0x01,	-0x10,	+0x10,	0,		0,		0,		0},		//��
	PawnDir[2][8]={
			{-0x01,		+0x01,	-0x10,	0,		0,		0,		0,		0},
			{-0x01,		+0x01,	+0x10,	0,		0,		0,		0,		0}
		};		//��

short KnightCheck[8] = {-0x10,-0x10,-0x01,+0x01,-0x01,+0x01,+0x10,+0x10};//����λ��
short BishopCheck[8] = {-0x11,-0x0f,+0x0f,+0x11,0,0,0,0};	//����λ��
short kingpalace[9] = {54,55,56,70,71,72,86,87,88};	//�ڷ��Ź�λ��

//�������Ӻ���λ������
const unsigned char KingPosition[256] ={
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
};
const unsigned char AdvisorPisition[256] = {
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
};
const unsigned char BishopPosition[256] ={
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
};
const unsigned char KnightPosition[256] ={
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
};
const unsigned char PawnPosition[2][256] ={
	{	//���
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	},
	{	//�ڱ�
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	}
};


//--------------------����ʵ��----------------------------------

//��������ֵת�����ַ���ʾ
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

void ClearBoard() //�����������
{
	int i;
	side = 0;
	for (i = 0; i < 256; i ++) 
	{
		board[i] = 0;
	}
}

//FEN�������Ӷ�Ӧ�������±�
//�±�0��1��2��3��4��5��6�ֱ��Ӧ��ʾ�����ˣ����������ڣ���
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

//��FEN����ʾ�ľ���ת����һά����
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

// ��һά�����ʾ�ľ���ת����FEN��
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

//�����������
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
	unsigned char n;//��һ���������ߵ�λ��
	int SideTag = 16 + side * 16;	//���巽���췽16���ڷ�32
	for(k=0; k<4; k++)//4������
	{
		n = p + KingDir[k];	//nΪ�µĿ����ߵ���λ��
		if(KingPosition[n])
		{
			if( !(board[n] & SideTag))	//Ŀ��λ����û�б�������
				SaveMove(p, n);
		}
	}
}

void AdvisorMove(unsigned char p)
{
	int k;
	unsigned char n;//��һ���������ߵ�λ��
	int SideTag = 16 + side * 16;	//���巽���췽16���ڷ�32
	for(k=0; k<4; k++)//4������
	{
		n = p + AdvisorDir[k];	//nΪ�µĿ����ߵ���λ��
		if(AdvisorPisition[n])
		{
			if( !(board[n] & SideTag))	//Ŀ��λ����û�б�������
				SaveMove(p, n);
		}
	}
}
void BishopMove(unsigned char p)
{
	int k;
	unsigned char n;//��һ���������ߵ�λ��
	unsigned char m;//����λ��
	int SideTag = 16 + side * 16;	//���巽���췽16���ڷ�32
	for(k=0; k<4; k++)//4������
	{
		n = p + BishopDir[k];	//nΪ�µĿ����ߵ���λ��
		if(BishopPosition[n])
		{
			m = p + BishopCheck[k];
			if(!board[m])	//����λ��������ռ��
			{
				if( !(board[n] & SideTag))	//Ŀ��λ����û�б�������
					SaveMove(p, n);
			}
		}
	}
}
void KnightMove(unsigned char p)
{
	int k;
	unsigned char n;//��һ���������ߵ�λ��
	unsigned char m;//����λ��
	int SideTag = 16 + side * 16;	//���巽���췽16���ڷ�32
	for(k=0; k<8; k++)//8������
	{
		n = p + KnightDir[k];	//nΪ�µĿ����ߵ���λ��
		if(KnightPosition[n])
		{
			m = p + KnightCheck[k];
			if(!board[m])	//����λ��������ռ��
			{
				if( !(board[n] & SideTag))	//Ŀ��λ����û�б�������
					SaveMove(p, n);
			}
		}
	}
}
void RookMove(unsigned char p)
{
	int k,j;
	unsigned char n;//��һ���������ߵ�λ��
	int SideTag = 16 + side * 16;	//���巽���췽16���ڷ�32
	for(k=0; k<4; k++)	//4������
	{
		for(j=1; j<10; j++)	//��������8�������ߵ�λ�ã����������9��λ��
		{
			n = p + j * RookDir[k];
			if(! KnightPosition[n])	//�������λ��
				break;
			if(! board[n] )	//Ŀ��λ��������
				SaveMove(p, n);
			else if ( board[n] & SideTag)	//Ŀ��λ�����б�������
				break;
			else	//Ŀ��λ�����жԷ�����
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
	unsigned char n;//��һ���������ߵ�λ��
	int SideTag = 16 + side * 16;	//���巽���췽16���ڷ�32
	int OverFlag;

	for(k=0; k<4; k++)	//4������
	{
		OverFlag = 0;
		for(j=1; j<10; j++)	//��������8�������ߵ�λ�ã����������9��λ��
		{
			n = p + j * CannonDir[k];
			if(!KnightPosition[n])	//�������λ��
				break;
			if(! board[n] )	//Ŀ��λ��������
			{
				if(!OverFlag)	//δ��ɽ
					SaveMove(p, n);
				//�ѷ�ɽ���������Զ���������һ��λ��
			}
			else//Ŀ��λ��������
			{
				if (!OverFlag)	//δ��ɽ���÷�ɽ��־
					OverFlag = 1;
				else	//�ѷ�ɽ
				{
					if(! (board[n] & SideTag))//�Է�����
						SaveMove(p, n);
					break;	//���۳Բ����ӣ����˳��˷�������
				}
			}
		}
	}
}
void PawnMove(unsigned char p)
{
	int k;
	unsigned char n;//��һ���������ߵ�λ��
	int SideTag = 16 + side * 16;	//���巽���췽16���ڷ�32
	for(k=0; k<3; k++)//3������
	{
		n = p + PawnDir[side][k];	//nΪ�µĿ����ߵ���λ��
		if(PawnPosition[side][n])
		{
			if( !(board[n] & SideTag))	//Ŀ��λ����û�б�������
				SaveMove(p, n);
		}
	}
}
void GenAllMove()
{
	short i, j;
	unsigned char p;	//p:����λ��
	int SideTag;	//���巽������16���ڷ�32

	SideTag = 16 + side * 16;

	for(i=3; i<13; i++)	//10��
	{
		for(j=3; j<12; j++) //9��
		{
			p=(i<<4)+j;	//����λ��
			if( !(board[p] & SideTag)) //�Է�������
				continue;	
			switch(board[p] - SideTag)
			{
			case 0:	//��
				KingMove(p);
				break;
			case 1:	//��
			case 2:
				AdvisorMove(p);
				break;
			case 3:	//��
			case 4:
				BishopMove(p);
				break;
			case 5:	//��
			case 6:
				KnightMove(p);
				break;
			case 7:	//��
			case 8:
				RookMove(p);
				break;
			case 9:	//��
			case 10:
				CannonMove(p);
				break;
			case 11://��
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
	printf(" ʾ������4-1             �� �� �� ��\n");
	printf("\n");
	printf("                         ���ߣ�����\n");
	printf("                         ʱ�䣺2007-8-29\n");
	printf("****************************************************************\n");
	printf("��ʼ����\n");
	StringToArray("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1");
	OutputBoard();

	printf("���ɵ��߷�\n");
	InitGen();
	GenAllMove();
	OutputMove();

	getch();
}