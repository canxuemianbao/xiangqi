#include "Board.h"
#include <stdlib.h>
#include <windows.h>
#include <time.h>
/////////////////////////////////////////////////////////////////
//
//   计算Zobrist键值
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

void CBoard::ClearHashTable()	//清空哈希表
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

void CBoard::LoadBook(const char *szBookFile) // 把开局库装入到置换表中
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
	while (fgets(szLineStr, 254, fp) != NULL)  //蒋鹏注：循环读取开局库的每一行
	{
		a++;
		lpLineChar = szLineStr;
		mvBook.Move(*(long *) lpLineChar); //蒋鹏注：将最前面四个字符转换成着法
		if (mvBook != NULL_MOVE) 
		{
			lpLineChar += 5;
			mvBook.capture = 0;
			while (*lpLineChar >= '0' && *lpLineChar <= '9')   //蒋鹏注：获取当前局面的值
			{
				mvBook.capture *= 10;
				mvBook.capture += *lpLineChar - '0';
				lpLineChar ++;
			}
			lpLineChar ++;
			// 以上代码读取开局库文本中的一行，读完后作以下处理：

			// 1. 把FEN串转换为局面，查找置换表(前提是局面对应的着法合理)；
			StringToArray(lpLineChar);
			if (board[mvBook.from])  //蒋鹏注：走子的位置上有子，即判断走法的合理性
			{
				lphsh = &HashTable[ZobristKey & HashMask];
				hshTemp = *lphsh;
				if ((hshTemp.flag & bookEXIST) == 0) 
				{	// 2. 如果置换表项未被填充，则填上标记为"BOOK_UNIQUE"的局面信息连同最佳着法

					hshTemp.check = ZobristKeyCheck;
					hshTemp.flag = bookUNIQUE;
					hshTemp.goodmove = mvBook;
					hshTemp.value = mvBook.capture;
					*lphsh = hshTemp;
				} 
				else 
				{
					if (hshTemp.check == ZobristKeyCheck)  //蒋鹏注：判断是否同一局面
					{
						if ((hshTemp.flag & bookUNIQUE) != 0) 
						{// 3. 如果置换表项已被填充为"BOOK_UNIQUE"，则把该项改成"BOOK_MULTI"，包括原来着法和增加的这个着法；
							if (bokListNum < MAX_BOOK_POS) 
							{
								hshTemp.check = ZobristKeyCheck;
								hshTemp.flag = bookMULTI;
								bokList[bokListNum][0] = hshTemp.goodmove;
								bokList[bokListNum][1] = mvBook;
								hshTemp.value = bokListNum; //蒋鹏注：wValue此时表示的是该局面在附加表中的位置
								hshTemp.depth = 2;	//depth
								bokListNum ++;
								*lphsh = hshTemp;
							}
						} 
						else 
						{
			              // 4. 如果置换表项已被填充为"BOOK_MULTI"，则只需增加这个着法。
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
move CBoard::GetBookMove(void)        // 从置换表中获取开局库着法
{
	int i, nThisValue;
	long dwMoveStr;
	move mv;
	HashNode hshTemp;
	move *lpbok;
	int TemValue[MAX_BOOK_MOVE];	//用于计算随机着法的辅助数组
	hshTemp = HashTable[ZobristKey & HashMask];

	if ((hshTemp.flag & bookEXIST) != 0 && hshTemp.check == ZobristKeyCheck) 
	{
		if ((hshTemp.flag & bookUNIQUE) != 0) 
		{
			// 如果置换表的标志是唯一着法的开局库局面，则直接输出这个着法
			dwMoveStr = hshTemp.goodmove.Coord();
			return hshTemp.goodmove;
		}	 
		else 
		{	// 如果置换表的标志是多个着法的开局库局面，则以权重为比率随机选择
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
