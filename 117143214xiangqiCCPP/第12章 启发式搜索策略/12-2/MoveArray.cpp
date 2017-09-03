#include "MoveArray.h"

move g_KillerMove[256][2];       // 杀手着法表

void MoveArrayStruct::Init(move mvHashArg, int nPly) 
{
	int i,j,start;
	mvHash = mvHashArg;
	mvKiller1 = g_KillerMove[nPly][0];
	mvKiller2 = g_KillerMove[nPly][1];
	
	//生成走法
	nMoveNum = g_Board.GenCapMove(mvs);
	nMoveNum = nMoveNum + g_Board.GenNonCapMove(mvs+nMoveNum);

	start=0;
	if(mvHash.from !=0 && mvHash.to!=0)	//置换表走法不为空
	{
		for(i=start; i<nMoveNum; i++)
		{
			if(mvs[i]== mvHash)
			{
				for(j=i; j>start; j--)
				{
					mvs[j] = mvs[j-1];
				}
				mvs[0]=mvHash;
				start++;
				break;
			}
		}
	}
	if(mvKiller1.from !=0 && mvKiller1.to!=0 && g_Board.LegalMove(mvKiller1) && g_Board.IsSafeMove(mvKiller1))	//第1杀手走法不为空
	{
		for(i=start; i<nMoveNum; i++)
		{
			if(mvs[i]== mvKiller1)
			{
				for(j=i; j>start; j--)
				{
					mvs[j] = mvs[j-1];
				}
				mvs[start]=mvKiller1;
				start++;
				break;
			}
		}
	}
	if(mvKiller2.from !=0 && mvKiller2.to!=0 && g_Board.LegalMove(mvKiller2) && g_Board.IsSafeMove(mvKiller2))	//第2杀手走法不为空
	{
		for(i=start; i<nMoveNum; i++)
		{
			if(mvs[i]== mvKiller2)
			{
				for(j=i; j>start; j--)
				{
					mvs[j] = mvs[j-1];
				}
				mvs[start]=mvKiller2;
				break;
			}
		}
	}
}    