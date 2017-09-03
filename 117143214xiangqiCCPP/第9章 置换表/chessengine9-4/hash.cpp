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
	HashTable = new HashNode[1024*1024];
	ClearHashTable();
}

void CBoard::ClearHashTable()	//清空哈希表
{
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

	HashNode A;
	A = HashTable[add];
	if (A.check == ZobristKeyCheck) 
	{
		if (A.depth > depth) 
		{
			if (A.flag == hashEXACT) 
			{
				return A.value;
			}
			if (A.flag == hashALPHA && A.value <= alpha)
			{
				return alpha;
			}
			if (A.flag == hashBETA && A.value >= beta)
			{
				return beta;
			}
			mv = A.goodmove;
		}
	}
	return NOVALUE;
}