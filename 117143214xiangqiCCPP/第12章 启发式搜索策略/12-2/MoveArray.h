#ifndef MOVE_ARRAY_H
#define MOVE_ARRAY_H

#include "Board.h"

struct MoveArrayStruct 
{
	int nMoveNum;	//�߷�����
	move mvHash;	//�û����õ��߷�
	move mvKiller1, mvKiller2;	//����ɱ���߷�
	move mvs[128];	//�߷��б�
	void Init(struct move mvHashArg, int nPly) ;	//��ʼ������
};

extern move g_KillerMove[256][2];       // ɱ���ŷ���

#endif