
                        /**
                         * @todo
                         * Trying to find user year and semester who can only login
                         */
                        const studentProfile = await StudentProfile.findOne({userId: user._id});
                        if(studentProfile){
                            console.log('year', studentProfile.year)
                            console.log('semester', studentProfile.semester)
                            if(studentProfile.year === '' || !studentProfile.year){
                                console.log('success')
                            }else {
                                return res.redirect('/')
                            }
                        }