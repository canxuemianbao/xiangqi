#ifndef MOVE_ARRAY_H
#define MOVE_ARRAY_H

#include "Board.h"

struct MoveArrayStruct 
{
	int nMoveNum;	//�߷�����
	int index;
	move mvHash;	//�û����õ��߷�
	move mvKiller1, mvKiller2;	//����ɱ���߷�
	move mvs[128];	//�߷��б�
	void Init(struct move mvHashArg, int nPly) ;	//��ʼ������
	void SetNonCapValue(int start);	//��ȡ�������߷��ļ�ֵ
	void Sort(void) ;
	void InitCap() ;	//��ʼ������,ֻ���ɳ����߷������ھ�̬����
};

extern move g_KillerMove[256][2];       // ɱ���ŷ���
extern unsigned char g_History[65536];  // ��ʷ��

#endif