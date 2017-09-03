#include "Board.h"
#include <stdlib.h>
#include <windows.h>
#include <time.h>
/////////////////////////////////////////////////////////////////
//
//   ����Zobrist��ֵ
//
////////////////////////////////////////////////////////////////
static long rand32()
{
    return rand() ^ ((long)rand() << 15) ^ ((long)rand() << 30);
}

static __int64 rand64()
{
    return rand() ^ ((__int64)rand() << 15) ^ ((__int64)rand() << 30) ^

        ((__int64)rand() << 45) ^ ((__int64)rand() << 60);
}

void CBoard::IniZobrist()
{
	int i, j;
	srand(time(NULL));
	ZobristPlayer = rand32();
	for (i = 0; i < 14; i ++) 
	{
		for (j = 0; j < 256; j ++) 
		{
			ZobristTable[i][j] = rand32();
		}
	}
	ZobristPlayerCheck = rand64();
	for (i = 0; i < 14; i ++) 
	{
		for (j = 0; j < 256; j ++) 
		{
			ZobristTableCheck[i][j] = rand64();
		}
	}
}

void CBoard::NewHashTable()
{
	HashMask = 1024*1024-1;
	if(HashTable)
		DelHashTable();
	HashTable = new HashNode[1024*1024];
	if(!HashTable)
	{
		printf("hash init failed\n");
		fflush(stdout);
	}
	ClearHashTable();
}

void CBoard::ClearHashTable()	//��չ�ϣ��
{
	bokListNum = 0;
	memset(HashTable, 0, (HashMask+1)*sizeof(HashNode));
}

void CBoard::DelHashTable(void) 
{
	if(HashTable)
		delete[] HashTable;
}

void CBoard::SaveHashTable(int value, int depth, int type, move mv)
{
	int add = ZobristKey & HashMask;
	
	HashNode A;
	if (value > WinValue)
	{
		value = value + ply;
	}
	if (value < -WinValue) 
	{
		value = value - ply;
	}
	A.value = value;
	A.check = ZobristKeyCheck;
	A.depth = depth;
	A.flag  = type;
	A.goodmove = mv;
	HashTable[add] = A;
}

int CBoard::ReadHashTable(int depth,int alpha, int beta, move &mv)
{
	int add = ZobristKey & HashMask;

	int temp;
	HashNode A;
	A = HashTable[add];
	if (A.check == ZobristKeyCheck) 
	{
		if (A.value > WinValue)
		{
			temp = A.value - ply;
		}
		if (A.value < -WinValue) 
		{
			temp = A.value + ply;
		}
		if (A.depth > depth) 
		{
			if (A.flag == hashEXACT) 
			{
				return temp;
			}
			if (A.flag == hashALPHA && temp <= alpha)
			{
				return alpha;
			}
			if (A.flag == hashBETA && temp >= beta)
			{
				return beta;
			}
			mv = A.goodmove;
		}
	}
	return NOVALUE;
}

void CBoard::LoadBook(const char *szBookFile) // �ѿ��ֿ�װ�뵽�û�����
{
	FILE *fp;
	char *lpLineChar;
	char szLineStr[256];
	move mvBook;
	HashNode hshTemp, *lphsh;
	
	fp = fopen(szBookFile, "rt");
	if (fp == NULL)
		return;
  
	int a=0;
	szLineStr[254] = szLineStr[255] = '\0';
	while (fgets(szLineStr, 254, fp) != NULL)  //����ע��ѭ����ȡ���ֿ��ÿһ��
	{
		a++;
		lpLineChar = szLineStr;
		mvBook.Move(*(long *) lpLineChar); //����ע������ǰ���ĸ��ַ�ת�����ŷ�
		if (mvBook != NULL_MOVE) 
		{
			lpLineChar += 5;
			mvBook.capture = 0;
			while (*lpLineChar >= '0' && *lpLineChar <= '9')   //����ע����ȡ��ǰ�����ֵ
			{
				mvBook.capture *= 10;
				mvBook.capture += *lpLineChar - '0';
				lpLineChar ++;
			}
			lpLineChar ++;
			// ���ϴ����ȡ���ֿ��ı��е�һ�У�����������´���

			// 1. ��FEN��ת��Ϊ���棬�����û���(ǰ���Ǿ����Ӧ���ŷ�����)��
			StringToArray(lpLineChar);
			if (board[mvBook.from])  //����ע�����ӵ�λ�������ӣ����ж��߷��ĺ�����
			{
				lphsh = &HashTable[ZobristKey & HashMask];
				hshTemp = *lphsh;
				if ((hshTemp.flag & bookEXIST) == 0) 
				{	// 2. ����û�����δ����䣬�����ϱ��Ϊ"BOOK_UNIQUE"�ľ�����Ϣ��ͬ����ŷ�

					hshTemp.check = ZobristKeyCheck;
					hshTemp.flag = bookUNIQUE;
					hshTemp.goodmove = mvBook;
					hshTemp.value = mvBook.capture;
					*lphsh = hshTemp;
				} 
				else 
				{
					if (hshTemp.check == ZobristKeyCheck)  //����ע���ж��Ƿ�ͬһ����
					{
						if ((hshTemp.flag & bookUNIQUE) != 0) 
						{// 3. ����û������ѱ����Ϊ"BOOK_UNIQUE"����Ѹ���ĳ�"BOOK_MULTI"������ԭ���ŷ������ӵ�����ŷ���
							if (bokListNum < MAX_BOOK_POS) 
							{
								hshTemp.check = ZobristKeyCheck;
								hshTemp.flag = bookMULTI;
								bokList[bokListNum][0] = hshTemp.goodmove;
								bokList[bokListNum][1] = mvBook;
								hshTemp.value = bokListNum; //����ע��wValue��ʱ��ʾ���Ǹþ����ڸ��ӱ��е�λ��
								hshTemp.depth = 2;	//depth
								bokListNum ++;
								*lphsh = hshTemp;
							}
						} 
						else 
						{
			              // 4. ����û������ѱ����Ϊ"BOOK_MULTI"����ֻ����������ŷ���
							if (hshTemp.depth < MAX_BOOK_MOVE) 
							{
								bokList[hshTemp.value][hshTemp.depth] = mvBook;
								hshTemp.depth ++;
							}
						}
					}
				}
			}
		}
	}
  
	fclose(fp);
}
move CBoard::GetBookMove(void)        // ���û����л�ȡ���ֿ��ŷ�
{
	int i, nThisValue;
	long dwMoveStr;
	move mv;
	HashNode hshTemp;
	move *lpbok;
	int TemValue[MAX_BOOK_MOVE];	//���ڼ�������ŷ��ĸ�������
	hshTemp = HashTable[ZobristKey & HashMask];

	if ((hshTemp.flag & bookEXIST) != 0 && hshTemp.check == ZobristKeyCheck) 
	{
		if ((hshTemp.flag & bookUNIQUE) != 0) 
		{
			// ����û���ı�־��Ψһ�ŷ��Ŀ��ֿ���棬��ֱ���������ŷ�
			dwMoveStr = hshTemp.goodmove.Coord();
			return hshTemp.goodmove;
		}	 
		else 
		{	// ����û���ı�־�Ƕ���ŷ��Ŀ��ֿ���棬����Ȩ��Ϊ�������ѡ��
			nThisValue = 0;
			lpbok = bokList[hshTemp.value];
			for (i = 0; i < hshTemp.depth; i ++) 
			{
				mv = lpbok[i];
				dwMoveStr = mv.Coord();
				nThisValue += mv.capture;
				TemValue[i] = nThisValue;
			}
			if (nThisValue > 0) 
			{
				nThisValue = rand32() % nThisValue;
				for (i = 0; i < hshTemp.depth; i ++) 
				{
					if(nThisValue < TemValue[i])
						break;
				}
				return lpbok[i];
			} 
			else 
			{
				mv = NULL_MOVE;
				return mv;
			}
		}
	} 
	else 
	{
		mv = NULL_MOVE;
		return mv;
	}
}
