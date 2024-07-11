import { LoadingOverlay, Modal, Select, Table, Tooltip } from '@mantine/core';
import axios from 'axios';
import { ArrowCircleLeft2, ArrowCircleRight2 } from 'iconsax-react';
import { useEffect, useState } from 'react';

const App = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [listUser, setListUser] = useState([]);

    const [listboard, setListBoard] = useState([])
    const [task, setTask] = useState([])
    const [detailTask, setDetailTask] = useState()
  const [opened, setOpened] = useState(false);
    const [display, setDisplay] = useState('day');
    const [listWeek, setListWeek] = useState([])
    const [listTaskCalendar, setListTaskCanlendar] = useState([])
    const [indexWeek, setIndexWeek] = useState(0);
    const [visible, setVisible] = useState(false);
    function getWeeksOfMonth(year, month) {
        const weeks = [];
        const firstDayOfMonth = new Date(year, month - 1, 1);
        let startOfWeek = new Date(firstDayOfMonth);
        let day = startOfWeek.getDay();
        let diff = (day <= 0 ? -6 : 1) - day;  // Điều chỉnh để bắt đầu từ thứ Hai
        startOfWeek.setDate(startOfWeek.getDate() + diff);

        let weekNumber = 1;
        while (startOfWeek.getMonth() <= (month - 1)) {
            let endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);

            if (endOfWeek.getMonth() > (month - 1)) {
                endOfWeek = new Date(year, month, 0); // Last day of the month
            }

            const weekStr = `W${weekNumber} ${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${endOfWeek.toLocaleString('en-US', { month: 'short' })}`;
            weeks.push(weekStr);

            startOfWeek.setDate(startOfWeek.getDate() + 7);
            weekNumber++;
        }

        return weeks;
    }
    const labelColorMapping = {
        "Đã Lên Lịch": "#4285F4",      // Blue
        "Đủ Thông Tin": "#4285F4",     // Blue
        "Đang Chạy": "#FBBC05",        // Orange
        "Nhận Thông Tin": "#F4B400",   // Yellow
        "Hoàn Thành": "#34A853",       // Green
        "Đang Sản Xuất": "#FBBC05",    // Orange
        "Hủy Bỏ": "#EA4335",           // Red
        "Chờ Duyệt": "#FF00FF",        // Pink
        "Đang duyệt": "#8E24AA",       // Purple
        "Đã Duyệt": "#F4B400"          // Yellow
    };

    function getColorForLabel(text) {
        return labelColorMapping[text] || "#000000"; // Default to black if the label is not found
    }
    const getTaskByUser = (week, listTask) => {
       return listUser.map((user) => {
            const taskByUser = [];
            week.map((w) =>{
                const splitDay = display == 'all-week' ? w.split(' ') : ['', '', '', ''];
                const startDay = `${year}-${`${month < 10 ? '0' : ''}`+(month)}-${splitDay[1]}`;
                const endDay = `${year}-${`${month < 10 ? '0' : ''}`+(month)}-${splitDay[3]}`;
                // console.log(startDay, endDay);
                const filterData = listTask.filter(item => {
        // const itemDate = new Date(item.start == null ? '': item.start);
        let isOwner = false;
        if(item?.task_owner?.hasOwnProperty('value')) {
        const assignUser = JSON.parse(item?.task_owner?.value)?.personsAndTeams
        if(assignUser?.filter((u) => u.id == user.id)?.length > 0) {
        isOwner = true
        }
        }
        // if(item.start != null) {
            const itemDate = new Date(item.start != null ? item.start : '');
            if(display == 'all-week') 
            return itemDate >= new Date(startDay) && itemDate <= new Date(endDay) && isOwner;
            else
            return item.start == `${year}-${`${month < 10 ? '0' : ''}`+(month)}-${Number(w) < 10 ? '0'+w : w}` && isOwner;
        // }
    });
    taskByUser.push({task: filterData, timeline: display == 'all-week' ? `${splitDay[1]}/${month}/${year} đến ${splitDay[3]}/${month}/${year}`: `${w}/${month}/${year}`, user: user})
            })
            return {
                list: taskByUser
            }
        })
    }
    const renderIndexWeek = (week, date) => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 0; i < week.length; i++) {
        const w = week[i];
        const parts = w.match(/(\d+)\s*-\s*(\d+)\s*(\w+)/);
        if (parts) {
            const start = parseInt(parts[1], 10);
            const end = parseInt(parts[2], 10);
            const weekMonth = parts[3];
            if (date >= start && date <= end && weekMonth === monthNames[new Date().getMonth() + 1]) {
                return i;
            }
        }
    }
    return -1; 
    }
    useEffect(() => {
        const w = getWeeksOfMonth(year, month);
        if(display === 'day') {
            const splitDay = w[w.length - 1].split(' ')[3]
            setListWeek(Array.from({length: Number(splitDay)}).map((v, i) => {
                return i+1;
            }))
            if(listTaskCalendar.length > 0) {
                const listW = Array.from({length: Number(splitDay)}).map((v, i) => {
                return i+1;
            })
            setTask(getTaskByUser(listW, listTaskCalendar))
        }
        }else if(display === 'week') {
            let splitDay = ""
            if(month == new Date().getMonth()+1) {
                // splitDay = w[renderIndexWeek(w, new Date().getDate())].split(' ');
                // setIndexWeek(renderIndexWeek(w, new Date().getDate()))
                splitDay = w[indexWeek].split(' ');
            }
            else splitDay = w[indexWeek].split(' ');
            const listW = []
            for(let i = Number(splitDay[1]); i <= Number(splitDay[3]); i++) {
                listW.push(i)
            }
            // số ngày trong tuần chưa đủ 
            if(listW.length < 7) {
            const dayTT = 7 - listW.length;
             for(let i = 1; i <= dayTT; i++) {
                listW.push(i)
            }
            }
            setTask(getTaskByUser(listW, listTaskCalendar))
            setListWeek(listW)
        }else {
            setListWeek(w)
            setTask(getTaskByUser(w, listTaskCalendar))
        }
    }, [month, year, display, indexWeek])
    useEffect(() => {
        const query = `
        query {
            users (limit: 50) {
              email
              account {
                name
                id
              }
              photo_thumb
              name
              id
            }
          }
        `

        axios.post("https://api.monday.com/v2", {
            query: query
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI5Njg5OTA5MCwiYWFpIjoxMSwidWlkIjo1MTUzOTA4MiwiaWFkIjoiMjAyMy0xMS0xN1QwNzoxMDozOS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTY2OTUxMjMsInJnbiI6InVzZTEifQ.2iuavWH4Uc_gsAGwJJgIKX2Bu7Zw2XwiAXYbrWbaj-Y'
            }
        }).then((res) => {
            setListUser(res.data.data.users);
        })
    }, [])
    useEffect(() => {
        let query = "query { folders (workspace_ids: 6404069) { name id children { id name }}}";
        axios.post("https://api.monday.com/v2", { query: query }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI5Njg5OTA5MCwiYWFpIjoxMSwidWlkIjo1MTUzOTA4MiwiaWFkIjoiMjAyMy0xMS0xN1QwNzoxMDozOS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTY2OTUxMjMsInJnbiI6InVzZTEifQ.2iuavWH4Uc_gsAGwJJgIKX2Bu7Zw2XwiAXYbrWbaj-Y'
            }
        }).then((res) => {
            //    setListBoard(res.data.boards);
            setListBoard(res.data.data?.folders?.flatMap((item) => item.children).filter((item) => item.name.includes('Công Việc')))

        });



    }, [])
    useEffect(() => {
        if (listboard.length > 0) {
            setVisible(true)
            // console.log(listboard.map((board) => board.id).join(" "));
            const query = `
          query {
    boards (ids: [${listboard.map((board) => board.id).join(" ")}]) {
      name
      state
      permissions
      items_page {
        items {
          id
          name
          board {
            name
          }
          subitems {
            id
            name
            column_values{
                id
                text
                value
                type
              }
          }
          column_values {
            id
            text
            value
            type
          }
        }
      }
    }
  }
          `

            axios.post("https://api.monday.com/v2", {
                query: query
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI5Njg5OTA5MCwiYWFpIjoxMSwidWlkIjo1MTUzOTA4MiwiaWFkIjoiMjAyMy0xMS0xN1QwNzoxMDozOS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTY2OTUxMjMsInJnbiI6InVzZTEifQ.2iuavWH4Uc_gsAGwJJgIKX2Bu7Zw2XwiAXYbrWbaj-Y'
                }
            }).then((res) => {
                const list = res.data.data?.boards.flatMap((i) => i.items_page.items);
                const arrTask = [];
                list.map((item) => {
                    const status = item?.column_values.filter((sub) => sub.id == 'task_status').length > 0 ? item.column_values.filter((sub) => sub.id == 'task_status')[0].text : ""
                    if (Array.isArray(item.subitems) && item.subitems.length > 0) {
                        item.subitems.map((key) => {
                            arrTask.push(
                                {
                                    title: `[${key.name}] - ` + item?.name,
                                    color: getColorForLabel(status),
                                    id: item?.id,
                                    board: item?.board.name,
                                    task_owner: key?.column_values.filter((sub) => sub.type == 'people').length > 0 ? key.column_values.filter((sub) => sub.type == 'people')[0] : null,
                                    task_status: key?.column_values.filter((sub) => sub.id == 'status').length > 0 ? key.column_values.filter((sub) => sub.id == 'status')[0] : null,
                                    task_priority: key?.column_values.filter((sub) => sub.id == "task_priority").length > 0 ? key.column_values.filter((sub) => sub.id == "task_priority")[0] : null,
                                    task_type: key?.column_values.filter((sub) => sub.id == "task_type").length > 0 ? key.column_values.filter((sub) => sub.id == "task_type")[0] : null,
                                    task_estimation: key?.column_values.filter((sub) => sub.id == "task_estimation").length > 0 ? key.column_values.filter((sub) => sub.id == "task_estimation")[0] : null,
                                    timelines: key?.column_values.filter((sub) => sub.type == "timeline").length > 0 ? key.column_values.filter((sub) => sub.type == "timeline")[0] : null,
                                    start: key?.column_values.filter((sub) => sub.type == "timeline").length > 0 ? key.column_values.filter((sub) => sub.type == "timeline")[0]?.text.split(" - ")[1] : null,
                                }
                            )
                        })
                    } else {
                        arrTask.push(
                            {
                                title: item?.name,
                                color: getColorForLabel(status),
                                id: item?.id,
                                board: item?.board.name,
                                task_owner: item?.column_values.filter((sub) => sub.id == 'task_owner').length > 0 ? item.column_values.filter((sub) => sub.id == 'task_owner') : null,
                                task_status: item?.column_values.filter((sub) => sub.id == 'task_status').length > 0 ? item.column_values.filter((sub) => sub.id == 'task_status') : null,
                                task_priority: item?.column_values.filter((sub) => sub.id == "task_priority").length > 0 ? item.column_values.filter((sub) => sub.id == "task_priority") : null,
                                task_type: item?.column_values.filter((sub) => sub.id == "task_type").length > 0 ? item.column_values.filter((sub) => sub.id == "task_type") : null,
                                task_estimation: item?.column_values.filter((sub) => sub.id == "task_estimation").length > 0 ? item.column_values.filter((sub) => sub.id == "task_estimation") : null,
                                start: item?.column_values.filter((sub) => sub.id == "timeline5__1").length > 0 ? item.column_values.filter((sub) => sub.id == "timeline5__1")[0]?.text.split(" - ")[1] : null,
                                timelines: item?.column_values.filter((sub) => sub.id == "timeline5__1").length > 0 ? item.column_values.filter((sub) => sub.id == "timeline5__1") : null,
                            }
                        )
                    }
                })
                setTask(getTaskByUser(listWeek, arrTask));
                setListTaskCanlendar(arrTask);
                setVisible(false)
            })

        }
    }, [listboard])
    const checkActiveDate = (week) => {
        let splitDay = [`${week}`,`${week}`, `${week}`];
        // if(display == 'all-week') splitDay = week.split(' ')
        // console.log(splitDay, new Date().getDay());
        const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        if(display == 'all-week') {
            console.log(week);
            splitDay = typeof week == 'string' ? week.split(' ') : ''
        if(Number(splitDay[1]) >= new Date().getDate() && Number(splitDay[3]) <= new Date().getDate() && shortMonthNames[new Date().getMonth()] == shortMonthNames[month-1]) return true;
        return false;
        }else {
        if(new Date().getDate() == Number(splitDay[1]) && shortMonthNames[new Date().getMonth()] == shortMonthNames[month-1]) return true;
        return false
        }
        // return false;
    }
    return (
        <>
            <div className='flex justify-between items-center'>
            <div className="flex items-center gap-3 my-4">
                <Select
                    placeholder="Chọn tháng"
                    data={
                        Array.from({ length: 12 }).map((item, index) => {
                            return {
                                label: 'Tháng ' + (index + 1),
                                value: (index + 1) + ""
                            }
                        })
                    }
                    onChange={(e) => {
                        setIndexWeek(0);
                        setMonth(Number(e))
                    }}
                    value={month + ""}
                />

                <Select
                    placeholder="Chọn năm"
                    data={[
                        { value: '2023', label: 'Năm 2023' },
                        { value: '2024', label: 'Năm 2024' },
                        { value: '2025', label: 'Năm 2025' },
                    ]}
                    value={year + ""}
                    onChange={(e) => setYear(Number(e))}
                />

            </div>
            <Select
                    placeholder="Hiển thị"
                    data={[
                        { value: 'day', label: 'Theo ngày' },
                        { value: 'week', label: 'Theo tuần' },
                        // { value: 'all-week', label: 'Tất cả tuần của tháng' },
                    ]}
                    value={display + ""}
                    onChange={(e) => setDisplay(e)}
                />
            </div>
            {
            display == 'week' && (
            <div className='flex justify-between items-center mb-2'>
            <div onClick={() => {
                if(indexWeek == 0) {
                    const w = getWeeksOfMonth(year, month - 1);
                    setIndexWeek(w[w.length-1]);
                    setMonth(month - 1)
                }else {
                    // setListWeek(listWeek[indexWeek - 1]);
                    setIndexWeek(indexWeek - 1);
                    // setTask(getTaskByUser(listWeek[indexWeek-1],listTaskCalendar))
                }
            }}>
                <Tooltip label="Previous Week" className={`cursor-pointer ${indexWeek == 0 ? `hidden`: ``}`} > 
                <ArrowCircleLeft2 size={28}  />
                </Tooltip>
            </div>
            <div 
             onClick={() => {
                if(indexWeek+1 == listWeek.length) {
                    const w = getWeeksOfMonth(year, month + 1);
                    setIndexWeek(0);
                    setMonth(month + 1)
                }else {
                    // setListWeek(listWeek[indexWeek + 1]);
                    setIndexWeek(indexWeek + 1);
                    // console.log(indexWeek+1, listWeek);
                    // setTask(getTaskByUser(listWeek[indexWeek+1],listTaskCalendar))
                }
            }}
            >
                <Tooltip label="Next Week" className={`cursor-pointer ${indexWeek == getWeeksOfMonth(year,month).length - 1? `hidden`: ``}`} >
                <ArrowCircleRight2 size={28}  />
                </Tooltip>
            </div>
            </div>
            )
            }
            <div className="table-container">
                <div className="fixed-column">
                    <table>
                        <thead>
                            <tr>
                                <th>Member</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                listUser && listUser.map((key, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <div className="member">
                                                    <img src={key.photo_thumb} alt="" />
                                                    <span className='font-bold'>
                                                        {key.name}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                            {/* Add more member rows as needed */}
                        </tbody>
                    </table>
                </div>
                <div className="scrollable-table">
                    <table>
                        <thead>
                            <tr>
                                {
                                    listWeek.map((w, i) => (
                                        <th key={i}>{
                                            checkActiveDate(w) ? (
                                                <>
                                                <div className="rounded-lg bg-[#34A853]">{w}</div>
                                                </>
                                            ): w
                                        }</th>
                                    ))
                                }
                                {/* Add more weeks as needed */}
                            </tr>
                        </thead>
                        <tbody>
                           {
                            task.map((t, i) => {
                                const list = t.list;
                                return(
                                    <tr className='h-[57px]' key={i}>
                                   {
                                    list.map((taskItem) => (
                                        <td 
                                        onClick={() => {
                                            
                                            setDetailTask({
                                                task: taskItem.task,
                                                timeline: taskItem.timeline,
                                                user: taskItem.user
                                            })
                                            setOpened(true)
                                        }}
                                        className='cursor-pointer'
                                        >
                                        {/* <div className="circle" data-value={taskItem.task.length}/> */}
                                        {
                                            taskItem.task.length > 0 && (
                                        <div className="circle" data-value={taskItem.task.length}/>
                                            )
                                        }
                                    </td>
                                    ))
                                   }
                                </tr>
                                )
                            })
                           }
                            {/* Add more rows corresponding to the members */}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Chi tiết"
        size={"85%"}
        zIndex={999999}
      >
        <h3 style={{fontSize: 24, margin: '8px 0px'}}>Timeline: <span style={{fontWeight: '900'}}>{detailTask?.timeline}</span></h3>
        <h3 style={{fontSize: 24, margin: '8px 0px'}}>Người thực hiện: <span style={{fontWeight: '900'}}>{detailTask?.user.name}</span></h3>
        <Table>
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Tên công việc</th>
                    <th>Dự án</th>
                    <th>Trạng thái</th>
                    <th>Mức độ ưu tiên</th>
                </tr>
            </thead>
            <tbody>
                {
                    detailTask?.task?.map((value, i) => (
                        <tr key={i}>
                            <td>{i+1}</td>
                            <td>{value.title}</td>
                            <td>{value.board}</td>
                            <td>
                                <div className='label-intro' style={{backgroundColor: getColorForLabel(value?.task_status?.text), padding: 5}}>{value?.task_status.text}</div>
                            </td>
                            <td>{value?.task_priority == null ? 'Chưa thiết lập': value?.task_priority.text}</td>
                        </tr>
                    ))
                }
            </tbody>
        </Table>
      </Modal>
      <LoadingOverlay visible={visible} overlayBlur={2} />
      
        </>

    )
}
export default App;