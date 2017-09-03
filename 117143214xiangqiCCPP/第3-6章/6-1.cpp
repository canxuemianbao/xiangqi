#include <stdio.h>
#include <conio.h>

//************************************************************************
//                  ��������
//************************************************************************

int side;					// �ֵ��ķ��ߣ�0��ʾ�췽��1��ʾ�ڷ�
unsigned char board[256];	// ��������
unsigned char piece[48];	// ��������
char FenString[128];		// �����FEN����ʽ

typedef struct {
	unsigned char  from, to;
	unsigned char  capture;
}move;
move MoveStack[128];	// ִ�е��߷�ջ
int StackTop;			// ջ��ָ��,ָ��ջ��Ԫ�ص���һλ��,=0��ʾջ��
move BestMove;	//�����õ�������߷�
int ply;		// ��ǰ�������
int MaxDepth;	//����������
const int MaxValue = 3000;	//��ֵ���ֵ

//************************************************************************
//                  ��������
//************************************************************************

// �����ʾ��غ���------------------------------------
void ClearBoard();				// �����������
void OutputBoard();				// �����������
void OutputPiece();				// �����������
char IntToChar(int a);			// ��������ֵת�����ַ�ֵ
int CharToSubscript(char ch);	// FEN�������Ӷ�Ӧ�������±�
	//�±�0��1��2��3��4��5��6�ֱ��Ӧ��ʾ�����ˣ����������ڣ���

void AddPiece(int pos, int pc);			// ��posλ����������pc
void StringToArray(const char *FenStr); // ��FEN����ʾ�ľ���ת����һά����
void ArrayToString();					// ��һά�����ʾ�ľ���ת����FEN��

// �߷����ɸ�������-----------------------------------
int SaveMove(unsigned char from, unsigned char to,move * mv);//�������ɵ��߷�,�ɹ�����1��ʧ�ܷ���0
int GenAllMove(move * MoveArray);	//�������е��߷�
void OutputMove(move * MoveArray, int MoveNum);//������е��߷�
int Check(int lSide);		//���lSideһ���Ƿ񱻽������Ǳ���������1�����򷵻�0


// �������� ------------------------------------------
short Eval();				// ��������
int IntToSubscript(int a);	// ��������ֵת�����±�
	//�±�0��1��2��3��4��5��6�ֱ��Ӧ��ʾ�����ˣ����������ڣ���

// ��������------------------------------------------
void MinMaxSearch();	// ����С�����㷨
bool MakeMove(move m);	// ִ���߷�
void UnMakeMove();		// �����߷�
void ChangeSide();		// �������巽


//************************************************************************
//                  ��������
//************************************************************************

// ������������
const short PieceValue[8]={1000,20,20,40,90,45,10,0}; //���Ӽ�ֵ��

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
//                  ����ʵ��
//************************************************************************

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
	for (i = 0; i < 48; i ++) 
	{
		piece[i] = 0;
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

void AddPiece(int pos, int pc) //��������
{
	board[pos] = pc;
	piece[pc] = pos;
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

//�����������
void OutputPiece()
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

//��������ֵת�����ַ���ʾ
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

short Eval(void)	//��������
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

int Check(int lSide)	//���lSideһ���Ƿ񱻽������Ǳ���������1�����򷵻�0
{
	unsigned char wKing,bKing; //���˫����˧��λ��
	unsigned char p,q;
	int r;	//r=1��ʾ����������Ϊ0
	int SideTag = 32 - lSide * 16;	//�˴���ʾlSide�Է��Ľ���ֵ
	int fSide = 1-lSide;	//�Է���־
	int i;
	int PosAdd;	//λ������

	wKing = piece[16];
	bKing = piece[32];
	if(!wKing || !bKing)
		return 0;

	//��⽫˧�Ƿ�����
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
			return r;	//��˧����
	}

	q = piece[48-SideTag];	//lSide������λ��

	//��⽫�Ƿ�����
	int k;
	unsigned char n;//��һ���������ߵ�λ��
	unsigned char m;//����λ��
	
	for(i=5;i<=6;i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<8; k++)//8������
		{
			n = p + KnightDir[k];	//nΪ�µĿ����ߵ���λ��
			if(n!=q)
				continue;

			if(LegalPosition[fSide][n] & PositionMask[3])	//����Ӧ�±�Ϊ3
			{
				m = p + KnightCheck[k];
				if(!board[m])	//����λ��������ռ��
				{
					return 1;
				}
			}
		}
	}
	
	//��⽫�Ƿ񱻳�����
	r=1;
	for(i=7;i<=8;i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		if(p%16 == q%16)	//��ͬһ������
		{
			PosAdd = (p>q?-16:16);
			for(p=p+PosAdd; p!=q; p = p+PosAdd)
			{
				if(board[p])	//�����м����Ӹ���
				{
					r=0;
					break;
				}
			}
			if(r)
				return r;
		}
		else if(p/16 ==q/16)	//��ͬһ������
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
	
	//��⽫�Ƿ��ڹ���
	int OverFlag = 0;	//��ɽ��־
	for(i=9;i<=10;i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		if(p%16 == q%16)	//��ͬһ������
		{
			PosAdd = (p>q?-16:16);
			for(p=p+PosAdd; p!=q; p = p+PosAdd)
			{
				if(board[p])
				{
					if(!OverFlag)	//��һ��
						OverFlag = 1;
					else			//������
					{
						OverFlag = 2;
						break;
					}
				}
			}
			if(OverFlag==1)
				return 1;
		}
		else if(p/16 ==q/16)	//��ͬһ������
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

	//��⽫�Ƿ񱻱�����
	for(i=11;i<=15;i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<3; k++)//3������
		{
			n = p + PawnDir[fSide][k];	//nΪ�µĿ����ߵ���λ��
			if((n==q) && (LegalPosition[fSide][n] & PositionMask[6]))	//��ʿ����Ӧ�±�Ϊ6
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
	unsigned char p;	//p:����λ��
	unsigned char n;	//��һ���������ߵ�λ��
	unsigned char m;	//���ȡ�����λ��
	int SideTag;		//���巽������16���ڷ�32
	int OverFlag;		//�ڵķ�ɽ��־
	move * mvArray = MoveArray;

	SideTag = 16 + 16 * side;
	
	p = piece[SideTag];	//����λ��
	if(!p)
		return 0;

	//�����߷�
	for(k=0; k<4; k++)//4������
	{
		n = p + KingDir[k];	//nΪ�µĿ����ߵ���λ��
		if(LegalPosition[side][n] & PositionMask[0])	//����Ӧ�±�Ϊ0
		{
			if( !(board[n] & SideTag))	//Ŀ��λ����û�б�������
				if(SaveMove(p, n, mvArray))
					mvArray++;
		}
	}

	//ʿ���߷�
	for(i=1; i<=2; i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<4; k++)//4������
		{
			n = p + AdvisorDir[k];	//nΪ�µĿ����ߵ���λ��
			if(LegalPosition[side][n] & PositionMask[1])	//ʿ����Ӧ�±�Ϊ1
			{
				if( !(board[n] & SideTag))	//Ŀ��λ����û�б�������
					if(SaveMove(p, n, mvArray))
						mvArray++;
			}
		}
	}

	//����߷�
	for(i=3; i<=4; i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<4; k++)//4������
		{
			n = p + BishopDir[k];	//nΪ�µĿ����ߵ���λ��
			if(LegalPosition[side][n] & PositionMask[2])	//�󽫶�Ӧ�±�Ϊ2
			{
				m = p + BishopCheck[k];
				if(!board[m])	//����λ��������ռ��
				{
					if( !(board[n] & SideTag))	//Ŀ��λ����û�б�������
						if(SaveMove(p, n, mvArray))
							mvArray++;
				}
			}
		}
	}
	
	//����߷�
	for(i=5; i<=6; i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<8; k++)//8������
		{
			n = p + KnightDir[k];	//nΪ�µĿ����ߵ���λ��
			if(LegalPosition[side][n] & PositionMask[3])	//����Ӧ�±�Ϊ3
			{
				m = p + KnightCheck[k];
				if(!board[m])	//����λ��������ռ��
				{
					if( !(board[n] & SideTag))	//Ŀ��λ����û�б�������
						if(SaveMove(p, n, mvArray))
							mvArray++;
				}
			}
		}
	}

	//�����߷�
	for(i=7; i<=8; i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<4; k++)	//4������
		{
			for(j=1; j<10; j++)	//��������8�������ߵ�λ�ã����������9��λ��
			{
				n = p + j * RookDir[k];
				if(!(LegalPosition[side][n] & PositionMask[4]))	//��ʿ����Ӧ�±�Ϊ4
					break;//�������λ��
				if(! board[n] )	//Ŀ��λ��������
				{
					if(SaveMove(p, n, mvArray))
						mvArray++;
				}
				else if ( board[n] & SideTag)	//Ŀ��λ�����б�������
					break;
				else	//Ŀ��λ�����жԷ�����
				{
					if(SaveMove(p, n, mvArray))
						mvArray++;
					break;
				}
			}
		}
	}

	//�ڵ��߷�
	for(i=9; i<=10; i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<4; k++)	//4������
		{
			OverFlag = 0;
			for(j=1; j<10; j++)	//��������8�������ߵ�λ�ã����������9��λ��
			{
				n = p + j * CannonDir[k];
				if(!(LegalPosition[side][n] & PositionMask[5]))	//��ʿ����Ӧ�±�Ϊ5
					break;//�������λ��
				if(! board[n] )	//Ŀ��λ��������
				{
					if(!OverFlag)	//δ��ɽ
						if(SaveMove(p, n, mvArray))
							mvArray++;
					//�ѷ�ɽ���������Զ���������һ��λ��
				}
				else//Ŀ��λ��������
				{
					if (!OverFlag)	//δ��ɽ���÷�ɽ��־
						OverFlag = 1;
					else	//�ѷ�ɽ
					{
						if(! (board[n] & SideTag))//�Է�����
							if(SaveMove(p, n, mvArray))
								mvArray++;
						break;	//���۳Բ����ӣ����˳��˷�������
					}
				}
			}
		}	
	}

	//�����߷�
	for(i=11; i<=15; i++)
	{
		p = piece[SideTag + i];
		if(!p)
			continue;
		for(k=0; k<3; k++)//3������
		{
			n = p + PawnDir[side][k];	//nΪ�µĿ����ߵ���λ��
			if(LegalPosition[side][n] & PositionMask[6])	//��ʿ����Ӧ�±�Ϊ6
			{
				if( !(board[n] & SideTag))	//Ŀ��λ����û�б�������
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

void UnMakeMove(void)
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

int MinMaxSearch(int depth)	// ����С�����㷨
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
	printf(" ʾ������6-1             ����С�����㷨\n");
	printf("\n");
	printf("                                ���ߣ�����\n");
	printf("                                ʱ�䣺2008-6-12\n");
	printf("****************************************************************\n");
	printf("��ʼ����\n");
	StringToArray("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1");
	OutputBoard();

	OutputPiece();

	MaxDepth = 4;
	StackTop = 0;
	MinMaxSearch(MaxDepth);
	printf("\n***   ����С�����㷨   ***\n");
	printf("����߷�: from %d to %d \n",BestMove.from,BestMove.to);

	getch();
}