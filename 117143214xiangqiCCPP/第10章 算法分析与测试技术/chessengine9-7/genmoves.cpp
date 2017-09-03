
#include "Board.h"

//���������߷�����
static short KingDir[8] ={-0x10,		-0x01,	+0x01,	+0x10,	0,		0,		0,		0};//��
static short AdvisorDir[8]={-0x11,		-0x0f,	+0x0f,	+0x11,	0,		0,		0,		0};		//ʿ
static short BishopDir[8] ={-0x22,		-0x1e,	+0x1e,	+0x22,	0,		0,		0,		0};	//��
static short KnightDir[8] ={-0x21,		-0x1f,	-0x12,	-0x0e,	+0x0e,	+0x12,	+0x1f,	+0x21};//��
static short RookDir[8]   ={-0x01,		+0x01,	-0x10,	+0x10,	0,		0,		0,		0};		//��
static short CannonDir[8] ={-0x01,		+0x01,	-0x10,	+0x10,	0,		0,		0,		0};		//��
static short PawnDir[2][8]={
			{-0x01,		+0x01,	-0x10,	0,		0,		0,		0,		0},
			{-0x01,		+0x01,	+0x10,	0,		0,		0,		0,		0}
		};		//��

static short KnightCheck[8] = {-0x10,-0x10,-0x01,+0x01,-0x01,+0x01,+0x10,+0x10};//����λ��
static short BishopCheck[8] = {-0x11,-0x0f,+0x0f,+0x11,0,0,0,0};	//����λ��
static short kingpalace[9] = {54,55,56,70,71,72,86,87,88};	//�ڷ��Ź�λ��

//�������Ӻ���λ������
static unsigned char LegalPosition[2][256] ={
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
static unsigned char PositionMask[7] = {2, 4, 16, 1, 1, 1, 8};

int CBoard::Check(int lSide)	//���lSideһ���Ƿ񱻽������Ǳ���������1�����򷵻�0
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

int CBoard::SaveMove(unsigned char from, unsigned char to,move * mv)
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

int CBoard::GenAllMove(move * MoveArray)
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

void CBoard::OutputMove(move * MoveArray, int MoveNum)
{
	int i;
	for(i=0; i<MoveNum; i++)
	{
		printf("from %3d to %3d\n",MoveArray[i].from,MoveArray[i].to);
	}
	printf("total move number:%d\n",MoveNum);
}

int CBoard::LegalMove(move mv)	//�ж��߷��Ƿ����
{
	move mvArray[128];
	int num,i;
	num = GenAllMove(mvArray);
	for(i=0; i<num; i++)
	{
		if(mv.from == mvArray[i].from && mv.to == mvArray[i].to)
			return 1;
	}
	return 0;
}

int CBoard::HasLegalMove()		//�жϵ�ǰ�����Ƿ��к����߷���û��������
{
	move mvArray[128];
	int num;
	num = GenAllMove(mvArray);
	return num;
}