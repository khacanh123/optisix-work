import { Modal, Select, Table } from '@mantine/core';
import axios from 'axios';
import { useEffect, useState } from 'react';

const App = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [listUser, setListUser] = useState([]);

    const [listboard, setListBoard] = useState([])
    const [task, setTask] = useState([])
    const [detailTask, setDetailTask] = useState()
  const [opened, setOpened] = useState(false);

    const [listWeek, setListWeek] = useState([])
    const [listTaskCalendar, setListTaskCanlendar] = useState([])

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
                const splitDay = w.split(' ');
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
            return itemDate >= new Date(startDay) && itemDate <= new Date(endDay) && isOwner;
        // }
    });
    taskByUser.push({task: filterData, timeline: `${splitDay[1]}/${month}/${year} đến ${splitDay[3]}/${month}/${year}`, user: user})
            })
            return {
                list: taskByUser
            }
        })
    }
    useEffect(() => {
        const w = getWeeksOfMonth(year, month);
        setListWeek(w)
        if(listTaskCalendar.length > 0) {
            setTask(getTaskByUser(w, listTaskCalendar))
        }
    }, [month, year])
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
            setListBoard(res.data.data?.folders?.flatMap((item) => item.children))

        });



    }, [])
    useEffect(() => {
        if (listboard.length > 0) {
            setVisible(true)
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
          subitems {
            id
            name
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
                    if (Array.isArray(item.subitems)) {
                        item.subitems.map((key) => {
                            arrTask.push(
                                {
                                    title: `[${key.name}] - ` + item?.name,
                                    color: getColorForLabel(status),
                                    id: item?.id,
                                    task_owner: item?.column_values.filter((sub) => sub.id == 'task_owner').length > 0 ? item.column_values.filter((sub) => sub.id == 'task_owner')[0] : null,
                                    task_status: item?.column_values.filter((sub) => sub.id == 'task_status').length > 0 ? item.column_values.filter((sub) => sub.id == 'task_status')[0] : null,
                                    task_priority: item?.column_values.filter((sub) => sub.id == "task_priority").length > 0 ? item.column_values.filter((sub) => sub.id == "task_priority")[0] : null,
                                    task_type: item?.column_values.filter((sub) => sub.id == "task_type").length > 0 ? item.column_values.filter((sub) => sub.id == "task_type")[0] : null,
                                    task_estimation: item?.column_values.filter((sub) => sub.id == "task_estimation").length > 0 ? item.column_values.filter((sub) => sub.id == "task_estimation")[0] : null,
                                    timelines: item?.column_values.filter((sub) => sub.id == "timeline5__1").length > 0 ? item.column_values.filter((sub) => sub.id == "timeline5__1")[0] : null,
                                    start: item?.column_values.filter((sub) => sub.id == "timeline5__1").length > 0 ? item.column_values.filter((sub) => sub.id == "timeline5__1")[0]?.text.split(" - ")[1] : null,
                                }
                            )
                        })
                    } else {
                        arrTask.push(
                            {
                                title: item?.name,
                                color: getColorForLabel(status),
                                id: item?.id,
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
    return (
        <>
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
                    onChange={(e) => setMonth(Number(e))}
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
                                        <th key={i}>{w}</th>
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
                                        <td>
                                        <div className="circle" data-value={taskItem.task.length} onClick={() => {
                                            
                                            setDetailTask({
                                                task: taskItem.task,
                                                timeline: taskItem.timeline,
                                                user: taskItem.user
                                            })
                                            setOpened(true)
                                        }}/>
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
        size={"xl"}
        zIndex={999999}
      >
        <h3 style={{fontSize: 24, margin: '8px 0px'}}>Timeline: <span style={{fontWeight: '900'}}>{detailTask?.timeline}</span></h3>
        <h3 style={{fontSize: 24, margin: '8px 0px'}}>Người thực hiện: <span style={{fontWeight: '900'}}>{detailTask?.user.name}</span></h3>
        <Table>
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Tên công việc</th>
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
                            <td>
        <div className='label-intro' style={{backgroundColor: getColorForLabel(value?.task_status?.text), padding: 5}}>{value?.task_status.text}</div>
                            </td>
                            <td>{value?.task_priority.text == '' ? 'Chưa thiết lập': value?.task_priority.text}</td>
                        </tr>
                    ))
                }
            </tbody>
        </Table>
      </Modal>
        </>

    )
}
export default App;