import React, { memo, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { LoadingOverlay, Modal } from '@mantine/core';

const App = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [listboard, setListBoard] = useState([])
    const [task, setTask] = useState()
    const [listTaskCalendar, setListTaskCanlendar] = useState([])
    
  const [visible, setVisible] = useState(false);
  const [opened, setOpened] = useState(false);
    const handleEventClick = (info) => {
        const event = info.event.extendedProps;
    setTask({
      title: info.event.title,
      color: info.event.backgroundColor,
      id: info.event.id,
      task_owner: event.task_owner,
      task_status: event.task_status,
      task_priority: event.task_priority,
      task_type: event.task_type,
      task_estimation: event.task_estimation,
      timelines: event.timelines,
      start: info.event.start.toISOString()
    });
        setOpened(true);
        console.log(event.task_priority);
        
    };

    const closeModal = () => {
        setModalOpen(false);
    };

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
    const cookie = "cf_clearance=BAfDGd.6aW5rTYWGo9OkWyURLDnXmOsECSpPJtUQPy8-1720062390-1.0.1.1-sdnEGwgnHmzGOrYbThASsRRnQ4mnVkR4FT9pkq_Lmn1BX0LE3EpAl0w82ZeFTdN358EGYewLfoMG.wQthvI_Yw; bb_visitor_id=29957ba3; region=use1; jwt_session_token=eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjM4MDMyNTQxNSwiYWFpIjoxLCJ1aWQiOjYzMDI3NDI2LCJpYWQiOiIyMDI0LTA3LTA0VDAzOjA2OjQwLjc4N1oiLCJwZXIiOiJtZTpzZXNzaW9uIiwiYWN0aWQiOjE2Njk1MTIzLCJyZ24iOiJ1c2UxIn0.BUFTFmyI3X6PLdTLqkoHH6bu0WrQstC5jp5kjF20808; region=use1; monday_active_account_slugs=%5B%22optisix%22%5D; dapulseAccountSlugs=%5B%22optisix%22%5D; dapulseLastLoginAccount=optisix; dapulseUserId=63027426; imf=itfx; zlp=jret; monday_pricing_version=13; monday_has_free_tier=true; monday_has_student_plan=false; should_see_purchase_now=false; platform_account_cluster=generic; platform_account_sub_cluster=; use_old_storage_settings=true; platform_account_id=16695123; platform_user_id=63027426; platform_test_website_existing_account_contact_sales_switcher_test=old_existing_account_contact_sales_switcher_test; platform_hide_basic=false; platform_free_tier_name_free=true; platform_free_tier_version=version(){return%222022_a%22}; is_paying_account=true; is_standalone=false; bb_visitor_aliased=true; users_option=5; ab.storage.userId.c3f41b74-f946-4349-a835-020a66f84a7d=%7B%22g%22%3A%2263027426%22%2C%22c%22%3A1720062409135%2C%22l%22%3A1720062409140%7D; ab.storage.deviceId.c3f41b74-f946-4349-a835-020a66f84a7d=%7B%22g%22%3A%22538bd531-1daf-47d9-7093-c47db538d3b0%22%2C%22c%22%3A1720062409142%2C%22l%22%3A1720062409142%7D; chat_session_current_user_id=63027426; bb_visitor_aliased_count=2; _ga=GA1.1.1571082143.1720063124; _ga_500WE4S491=GS1.1.1720063123.1.1.1720064046.0.0.0; __cf_bm=gQCFXs2J6UGeccxXbLWPeHqHjOqnJ9Y2OBdDCNzm5iw-1720064281-1.0.1.1-ZgZsuNNbTwYq6YIDhl5QDAz0opShgwyvyYFm22.dDv8LqTCnPU5flClU9KNKne2cc7JBI9hmvn.jWcoMzWMP0edzq0pLKJwl2Y4HDrnqi5M; ab.storage.sessionId.c3f41b74-f946-4349-a835-020a66f84a7d=%7B%22g%22%3A%22f9e0106b-f07a-5433-699b-7cc0a28a8c76%22%2C%22e%22%3A1720066893982%2C%22c%22%3A1720062409138%2C%22l%22%3A1720065093982%7D; monday_slug_details=%5B%7B%22un%22%3A%22Nguy%E1%BB%85n+Kh%E1%BA%AFc+Anh%22%2C%22ue%22%3A%22anhnk%40optisix.com%22%2C%22ui%22%3A63027426%2C%22us%22%3A89%2C%22an%22%3A%22Optisix%22%2C%22ac%22%3A%222023-04-28T03%3A05%3A12Z%22%2C%22ai%22%3A16695123%2C%22sl%22%3A%22optisix%22%2C%22lu%22%3A%222024-07-04T03%3A52%3A03%2B00%3A00%22%7D%5D; encUserId=eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjM1MDMyMDIyNTksImRhdCI6NjMwMjc0MjZ9.9d6Z5nu2nMGcrPhTC2OJq0tFxkOw1QIdsi_trcA5Y_k; dapulse_session=ayt6U2creXZIZ1dQelh0bWd2M1pOSlN2OFcyYUlxY2JsRXNrTTliTWJrd0NzV00zZFVha1pWY0swY2xmUnQzN09OaFhoUFFSLzJnRld0TDVENWN2Y3JSa0ltUk4vQ2RPanU2cXlvWGdvN0FBNjJ1QWl3L05TQ1FXWjJTaVkxZDc0Z2I0VXpXRlFoa1JtWmdzQ095d25rR3NQeVFnUTFOeFdGbTl6WlRUQTduVzZKTjR5c2V1ekRJTGxOUUFzRFo2aFYvYXE5Z1lmZHlUWUduYkRvR0k0QT09LS1CanFFYTVvVWVLSmdqU2JVOWpUZ1NBPT0%3D--1b2b791af6b90b1c23dd644f8042bf2ec9180aa7";
    useEffect(() => {
      let query = "query { folders (workspace_ids: 6404069) { name id children { id name }}}";
        axios.post("https://api.monday.com/v2", {query: query}, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization' : 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI5Njg5OTA5MCwiYWFpIjoxMSwidWlkIjo1MTUzOTA4MiwiaWFkIjoiMjAyMy0xMS0xN1QwNzoxMDozOS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTY2OTUxMjMsInJnbiI6InVzZTEifQ.2iuavWH4Uc_gsAGwJJgIKX2Bu7Zw2XwiAXYbrWbaj-Y'
           }
        }).then((res) => {
            //    setListBoard(res.data.boards);
            setListBoard(res.data.data?.folders?.flatMap((item) => item.children).filter((item) => item.name.includes('Công Việc')));

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
                'Authorization' : 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI5Njg5OTA5MCwiYWFpIjoxMSwidWlkIjo1MTUzOTA4MiwiaWFkIjoiMjAyMy0xMS0xN1QwNzoxMDozOS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTY2OTUxMjMsInJnbiI6InVzZTEifQ.2iuavWH4Uc_gsAGwJJgIKX2Bu7Zw2XwiAXYbrWbaj-Y'
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
                    }else {
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
                setListTaskCanlendar(arrTask);
                setVisible(false)
            })

        }
    }, [listboard])
       return (
        <>
            <div className="App">
                <div id="calendar">
                    {
                        // update && (
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={listTaskCalendar}
                            eventClick={handleEventClick}
                            dayMaxEvents={4} // Hiển thị tối đa 3 sự kiện mỗi ngày
                            moreLinkClick="popover"
                            height={"auto"} // Điều chỉnh chiều cao tự động theo nội dung
                            contentHeight={600}

                        />
                        // )
                    }
                </div>

                <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Chi tiết công việc"
        size={"lg"}
        zIndex={999999}
      >
        <h3 style={{fontSize: 24, margin: '8px 0px'}}>Tên công việc: <span style={{fontWeight: 'normal'}}>{task?.title}</span></h3>
        <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
        <h3 style={{fontSize: 24, margin: '8px 0px'}}>Trạng thái: </h3>
        <div className='label-intro' style={{backgroundColor: getColorForLabel(task?.task_status?.text), fontSize: 20}}>{task?.task_status.text}</div>
        </div>
        <h3 style={{fontSize: 24, margin: '8px 0px'}}>Người thực hiện: <span style={{fontWeight: 'normal'}}>{task?.task_owner.text}</span></h3>
        <h3 style={{fontSize: 24, margin: '8px 0px'}}>Mức độ ưu tiên: <span style={{fontWeight: 'normal'}}>{task?.task_priority.text == '' ? 'Chưa thiết lập': task?.task_priority.text}</span></h3>
      </Modal>
            </div>

        <LoadingOverlay visible={visible} overlayBlur={2} />
        </>
    );
};

export default App;
