import React, { ReactNode } from 'react';
import moment from 'moment';
const changeDate = (str: string) => {
    return moment(str).format('YYYY년 MM월 DD일 HH시 mm분 ss초')
}

export default changeDate;