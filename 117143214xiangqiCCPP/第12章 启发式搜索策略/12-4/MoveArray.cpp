#include "MoveArray.h"

move g_KillerMove[256][2];       // ɱ���ŷ���
unsigned char g_History[65536];  // ��ʷ��

void MoveArrayStruct::InitCap() 	//��ʼ������,ֻ���ɳ����߷������ھ�̬����
{
	//�����߷�
	index = 0;
	nMoveNum = g_Board.GenCapMove(mvs);
	Sort();
}

void MoveArrayStruct::Init(move mvHashArg, int nPly) 
{
	int i,j,start;
	mvHash = mvHashArg;
	mvKiller1 = g_KillerMove[nPly][0];
	mvKiller2 = g_KillerMove[nPly][1];
	
	//�����߷�
	index = 0;
	nMoveNum = g_Board.GenCapMove(mvs);
	Sort();
	index = nMoveNum;
	nMoveNum = nMoveNum + g_Board.GenNonCapMove(mvs+nMoveNum);
	SetNonCapValue(index);
	Sort();
	
	start=index;
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

	start = 0;
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
				mvs[start]=mvHash;
				break;
			}
		}
	}

}  

void MoveArrayStruct::SetNonCapValue(int start)	//��ȡ�������߷��ļ�ֵ
{
	int i;
	for (i = start; i < nMoveNum; i ++) 
	{
		mvs[i].capture = g_History[mvs[i].from * 256 + mvs[i].to];
	}
}


// ��������
static const int ShellStep[8] = {0, 1, 4, 13, 40, 121, 364, 1093};

void MoveArrayStruct::Sort(void) 
{
	int i, j, nStep, nStepLevel;
	move mvsBest;
	nStepLevel = 1;
	while (ShellStep[nStepLevel] < nMoveNum) 
	{
		nStepLevel ++;
	}
	nStepLevel --;
	while (nStepLevel > 0) 
	{
		nStep = ShellStep[nStepLevel];
		for (i = index + nStep; i < nMoveNum; i ++) 
		{
			mvsBest = mvs[i];
			j = i - nStep;
			while (j >= index && mvsBest.capture > mvs[j].capture) 
			{
				mvs[j + nStep] = mvs[j];
				j -= nStep;
			}
			mvs[j + nStep] = mvsBest;
		}
		nStepLevel --;
	}
}