#include "MoveArray.h"

move g_KillerMove[256][2];       // ɱ���ŷ���

void MoveArrayStruct::Init(move mvHashArg, int nPly) 
{
	int i,j,start;
	mvHash = mvHashArg;
	mvKiller1 = g_KillerMove[nPly][0];
	mvKiller2 = g_KillerMove[nPly][1];
	
	//�����߷�
	nMoveNum = g_Board.GenCapMove(mvs);
	nMoveNum = nMoveNum + g_Board.GenNonCapMove(mvs+nMoveNum);

	start=0;
	if(mvHash.from !=0 && mvHash.to!=0)	//�û����߷���Ϊ��
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
	if(mvKiller1.from !=0 && mvKiller1.to!=0 && g_Board.LegalMove(mvKiller1) && g_Board.IsSafeMove(mvKiller1))	//��1ɱ���߷���Ϊ��
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
	if(mvKiller2.from !=0 && mvKiller2.to!=0 && g_Board.LegalMove(mvKiller2) && g_Board.IsSafeMove(mvKiller2))	//��2ɱ���߷���Ϊ��
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